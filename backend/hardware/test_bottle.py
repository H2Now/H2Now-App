# For PI only to run
from bottle import BottleHardware
import time
import RPi.GPIO as GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

monitor = BottleHardware()
monitor.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    monitor.stop()

