from hardware.bottle import BottleHardware
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from dotenv import load_dotenv
import os
import time
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure PubNub
pnconfig = PNConfiguration()
pnconfig.publish_key = os.getenv("PUBLISH_KEY")
pnconfig.subscribe_key = os.getenv("SUBSCRIBE_KEY")
BOTTLE_ID = os.getenv("BOTTLE_ID")
pnconfig.uuid = BOTTLE_ID
pnconfig.heartbeat_interval = 15

pubnub = PubNub(pnconfig)
channel = os.getenv("PUBNUB_CHANNEL")

if not channel:
    raise ValueError("PUBNUB_CHANNEL not set in .env")
print(f"Publishing to channel: {channel}")

# Subscribe with presence enabled
pubnub.subscribe().channels([channel]).with_presence().execute()
print(f"✅ {BOTTLE_ID} subscribed with presence (heartbeat: {pnconfig.heartbeat_interval}s)")

BACKEND_URL = os.getenv("BACKEND_URL", "https://h2now.online")

# Poll every 1 minute
POLL_INTERVAL = 60

def fetch_settings(monitor):
    try:
        res = requests.get(f"{BACKEND_URL}/water_bottle/{BOTTLE_ID}/settings", timeout=10)
        if res.status_code == 200:
            data = res.json()
            if data.get("success"):
                settings = data.get("settings", {})
                reminder_freq = settings.get("reminderFreq", 0)
                bottle_alert_enabled = settings.get("bottleAlertEnabled", False)
                # Update monitor with new settings
                monitor.update_reminder_settings(reminder_freq, bottle_alert_enabled)
                print(f"Settings fetched from backend, Reminder Frequency: {reminder_freq}, Alert Enabled?: {bottle_alert_enabled}")
                return True
            else:
                print(f"Failed to fetch settings: {res.status_code}")
    except requests.RequestException as e:
        print(f"Error fetching settings: {e}")
    
    return False


# Initialize and start bottle monitoring
monitor = BottleHardware()

# Fetch settings
fetch_settings(monitor)
last_settings_fetch = time.time()

# starts the _monitor_loop in a background thread
monitor.start() 

try:
    while True:
        now = time.time()
        # Poll for every time difference between now and last time setting was fetched exceeds poll interval
        if now - last_settings_fetch >= POLL_INTERVAL:
            fetch_settings(monitor)
            last_settings_fetch = now

        # Fetch any new events from the bottle hardware
        events = monitor.get_events()
        for e in events:
            if e.startswith("bottle_placed|"):
                parts = e.split("|")
                event_type = "bottle_placed"
                actual_intake = int(parts[1])

                message = {
                    "type": event_type,
                    "bottleID": BOTTLE_ID,
                    "actual_intake": actual_intake,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                message = {
                    "type": e,
                    "bottleID": BOTTLE_ID,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Publish to PubNub
            pubnub.publish().channel(channel).message(message).sync()
            print(f"Published to {channel}")

except KeyboardInterrupt:
    print("Stopping monitoring...")

finally:
    monitor.cleanup()
    pubnub.unsubscribe_all()

