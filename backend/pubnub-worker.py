from hardware.bottle import BottleHardware
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

# Configure PubNub
pnconfig = PNConfiguration()
pnconfig.publish_key = os.getenv("PUBLISH_KEY")
pnconfig.subscribe_key = os.getenv("SUBSCRIBE_KEY")
pnconfig.uuid = os.getenv("PUBNUB_UUID")

pubnub = PubNub(pnconfig)
channel = os.getenv("PUBNUB_CHANNEL")

if not channel:
    raise ValueError("PUBNUB_CHANNEL not set in .env")
print(f"Publishing to channel: {channel}")

# Initialize and start bottle monitoring
monitor = BottleHardware()
monitor.start()  # starts the _monitor_loop in a background thread

try:
    while True:
        # Fetch any new events from the bottle hardware
        events = monitor.get_events()
        for e in events:
            print("Detected event:", e)  # For debugging
            # Publish to PubNub
            pubnub.publish().channel(channel).message({"event": e}).sync()
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Stopping monitoring...")

finally:
    monitor.cleanup()

