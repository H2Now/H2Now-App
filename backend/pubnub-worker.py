from hardware.bottle import BottleHardware
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from dotenv import load_dotenv
import os
import time
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

# Initialize and start bottle monitoring
monitor = BottleHardware()
monitor.start()  # starts the _monitor_loop in a background thread

try:
    while True:
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

