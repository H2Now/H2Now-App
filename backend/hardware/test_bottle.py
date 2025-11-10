# For PI only to run
from hardware.bottle import BottleMonitor
import time

monitor = BottleMonitor()
monitor.start()

try:
    while True:
        print("Drinking:", monitor.drinking, "Picked:", monitor.bottle_picked)
        time.sleep(2)
except KeyboardInterrupt:
    monitor.stop()