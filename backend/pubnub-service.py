from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from pubnub.callbacks import SubscribeCallback
from dotenv import load_dotenv
import os
import mysql.connector
from datetime import datetime
import time

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

active_sessions = {}

# PubNub Event Listener
class BottleEventListener(SubscribeCallback):
    def presence(self, pubnub, presence):
        # Gets the UUID of who joined/left (bottle_001, flask_server)
        uuid = presence.uuid
        action = presence.event

        print(f"🔔 PRESENCE EVENT RECEIVED: uuid={uuid}, action={action}")

        # Ignoring non-bottle UUIDs (flask-server)
        if not uuid.startswith("B"):
            return  
        
        bottle_id = uuid

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # When the Pi is online
            if action == "join":
                cursor.execute(
                    "UPDATE Bottle SET connected = TRUE, connectedAt = NOW() WHERE bottleID = %s",
                    (bottle_id,)
                )
                conn.commit()
            # When the Pi is offline
            elif action in ["leave", "timeout"]:
                cursor.execute(
                    "UPDATE Bottle SET connected = FALSE WHERE bottleID = %s",
                    (bottle_id,)
                )
                conn.commit()


            if bottle_id in active_sessions:
                self._end_drinking_session(bottle_id, cursor, conn)
        finally:
            cursor.close()
            conn.close()

    def message(self, pubnub_instance, res):
        print(f"Message received: {res.message}")
        message_data = res.message
        
        if not isinstance(message_data, dict):
            return
        
        event_type = message_data.get("type")
        bottle_id = message_data.get("bottleID")
        actual_intake = message_data.get("actual_intake")

        if not bottle_id:
            print("Missing bottleID...")
            return

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute(
                "SELECT bottleID, userID, capacity FROM Bottle WHERE bottleID = %s",
                (bottle_id,)
            )
            bottle_info = cursor.fetchone()

            if not bottle_info:
                print(f"Bottle {bottle_id} not found in database.")
                return

            user_id = bottle_info["userID"]
            print(f"✅ Found bottle {bottle_id} for user {user_id}")

            if event_type == "drinking_start":
                self._start_drinking_session(bottle_id, cursor, conn)
            elif event_type == "bottle_placed":
                intake = self._end_drinking_session(bottle_id, cursor, conn, actual_intake)
                if intake and intake > 0:
                    self._update_daily_intake(bottle_id, user_id, intake, cursor, conn)
        finally:
            cursor.close()
            conn.close()

    def _start_drinking_session(self, bottle_id, cursor, conn):
        # check if there's already an active session for the bottle
        if bottle_id not in active_sessions:
            cursor.execute(
                "INSERT INTO DrinkingSession (bottleID, startTime) VALUES(%s, NOW())",
                (bottle_id,)
            )
            session_id = cursor.lastrowid
            conn.commit()
            active_sessions[bottle_id] = {
                "session_id": session_id,
                "start_time": datetime.now()
            }

    def _end_drinking_session(self, bottle_id, cursor, conn, actual_intake=None):
        # if bottle is not in active session, unable to end it
        if bottle_id not in active_sessions:
            print("No active session to end...")
            return None
        
        session_info = active_sessions[bottle_id]

        # get the time difference between drinking start till drinking end
        duration = int((datetime.now() - session_info["start_time"]).total_seconds())
        
        # Use actual intake from load cell
        if actual_intake is not None and actual_intake > 0:
            cursor.execute(
                "UPDATE DrinkingSession SET endTime = NOW(), duration = %s, estimatedIntake = %s WHERE sessionID = %s",
                (duration, actual_intake, session_info["session_id"])
            )
            conn.commit()
            print(f"Recorded session: {actual_intake}ml in {duration}s")
        else:
            # No water consumed, delete the session
            cursor.execute(
                "DELETE FROM DrinkingSession WHERE sessionID = %s",
                (session_info["session_id"],)
            )
            conn.commit()

        # Remove from active sessions
        del active_sessions[bottle_id]
        
        return actual_intake if actual_intake and actual_intake > 0 else 0
    
    def _update_daily_intake(self, bottle_id, user_id, intake_amount, cursor, conn):
        # if no record exists for today, create one else just update the intake amount
        cursor.execute(
            """
            INSERT INTO Intake (userID, bottleID, intakeDate, totalIntake, goalReached)
            VALUES (%s, %s, CURDATE(), %s, FALSE)
            ON DUPLICATE KEY UPDATE totalIntake = totalIntake + %s
            """,
            (user_id, bottle_id, intake_amount, intake_amount)
        )
        # check if user has reached their goal after intake
        cursor.execute( 
            """
            UPDATE Intake i
            JOIN Bottle b ON i.bottleID = b.bottleID
            SET i.goalReached = (i.totalIntake >= b.goal)
            WHERE i.bottleID = %s AND i.intakeDate = CURDATE()
            """,
            (bottle_id,)
        )
        conn.commit()

if __name__ == "__main__":
    # Configure PubNub
    pnconfig = PNConfiguration()
    pnconfig.subscribe_key = os.getenv("SUBSCRIBE_KEY")
    pnconfig.uuid = "flask-server"
    pubnub = PubNub(pnconfig)
    
    # Start listener
    listener = BottleEventListener()
    pubnub.add_listener(listener)
    channel = os.getenv("PUBNUB_CHANNEL")
    
    print("="*60)
    print("🚀 PubNub Service Starting")
    print("="*60)
    print(f"   Subscribe Key: {os.getenv('SUBSCRIBE_KEY')[:15]}...")
    print(f"   UUID: {pnconfig.uuid}")
    print(f"   Channel: {channel}")
    print("="*60)
    
    pubnub.subscribe().channels([channel]).with_presence().execute()
    print(f"✅ Subscribed to '{channel}' with presence enabled")
    print("👂 Listening for events... (Press Ctrl+C to stop)")
    print()
    
    # Keep service running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping PubNub listener...")
        pubnub.unsubscribe_all()