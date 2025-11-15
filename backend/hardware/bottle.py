import smbus
import time
import RPi.GPIO as GPIO
from threading import Thread, Lock
from queue import Queue
import buzzer, mpu6050, load_cell

class BottleHardware:
    def __init__(self):
        # Classes to use
        self.buzzer = buzzer.PiezoBuzzer()
        self.mpu6050 = mpu6050.MPU6050()
        self.load_cell = load_cell.LoadCell()

        # Threading
        self.running = False
        self.thread = None
        self.events_queue = Queue()
        self.lock = Lock()


    def _monitor_loop(self):
        try:
            while self.running:
                ax, ay, az = self.mpu6050.read_accel()
                pitch = self.mpu6050.tilt_angles(ax, ay, az)
                now = time.time()
                events = [] # Events are appended here to send to PubNub 

                # Update previous readings
                self.mpu6050.update_readings(ax, ay, az, pitch)

                # Movement detection
                if self.mpu6050.detect_movement(ax, ay, az):
                    events.append("Bottle has been picked up!")


                # Drinking detection
                is_drinking = self.mpu6050.detect_drinking(pitch, now)
                if is_drinking is True:
                    events.append("Drinking has started")
                elif is_drinking is False:
                    events.append("Drinking has been stopped")


                # Inactivity alert
                if self.mpu6050.detect_inactivity(now):
                    events.append("Please drink your water!")
                    self.buzzer.trigger_buzzer()

                # Add events to queue
                for e in events:
                    with self.lock:
                        self.events_queue.put(e)

                time.sleep(0.1)

        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()

    # Set up
    def start(self):
        if not self.running:
            self.running = True
            self.thread = Thread(target=self._monitor_loop, daemon=True)
            self.thread.start()


    # Tear down
    def cleanup(self):
        self.buzzer.buzzer_pwm.stop()
        GPIO.cleanup()
        self.running = False