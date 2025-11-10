# For PI only to run
from bottle import BottleHardware
import time

monitor = BottleHardware()
monitor.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    monitor.stop()

