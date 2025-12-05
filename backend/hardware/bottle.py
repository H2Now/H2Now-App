import smbus
import time
import RPi.GPIO as GPIO
from threading import Thread, Lock
from queue import Queue
import buzzer, mpu6050, load_cell

class BottleHardware:
    def __init__(self):
        # Classes to use
        print("Initialising buzzer...")
        self.buzzer = buzzer.PiezoBuzzer()

        print("Initialising mpu6050...")
        self.mpu6050 = mpu6050.MPU6050()

        print("Initialising load cell...")
        self.load_cell = load_cell.LoadCell()

        # Threading
        self.running = False
        self.thread = None
        self.events_queue = Queue()
        self.lock = Lock()

        # Track weight when bottle is picked up
        self.pickup_weight = None

    def update_reminder_settings(self, reminder_freq_mins, bottle_alert_enabled):
        self.mpu6050.update_reminder_settings(reminder_freq_mins, bottle_alert_enabled)

    def _monitor_loop(self):
        try:
            while self.running:
                ax, ay, az = self.mpu6050.read_accel()
                pitch = self.mpu6050.tilt_angles(ax, ay, az)
                
                weight = self.load_cell.read_weight()
                now = time.time()
                events = [] # Events are appended here to send to PubNub 

                # Movement detection - Record weight at pickup
                if self.mpu6050.detect_movement(ax, ay, az, now):
                    self.pickup_weight = weight
                    print(f"Bottle is picked up, weight: {weight}ml")
                    events.append("bottle_picked")

                # Bottle has been placed down detection - Calculate intake
                if self.mpu6050.detect_bottle_placement(now, pitch):
                    placement_weight = weight

                    # Calculate water intake
                    if self.pickup_weight is not None:
                        actual_intake = self.pickup_weight - placement_weight
                        # Only record if more than 5ml was consumed
                        if actual_intake >= 5:
                            actual_intake = int(round(actual_intake))
                            print(f"Bottle is placed down, consumed: {actual_intake}ml")
                            events.append(f"bottle_placed|{actual_intake}")
                        else:
                            print("Bottle is placed down, no significcant water consumed")
                            events.append("bottle_placed")
                    else:
                        print("Bottle is placed down, no pickup weight was recorded!")
                        events.append("bottle_placed")

                    # Reset pickup weight for next drinking session
                    self.pickup_weight = None
                    self.load_cell.prev_weight = placement_weight

                # Drinking detection
                is_drinking = self.mpu6050.detect_drinking(pitch, now)
                if is_drinking is True:
                    events.append("drinking_start")

                # Inactivity alert
                if self.mpu6050.detect_inactivity(now):
                    events.append("reminder_alert")
                    self.buzzer.trigger_buzzer()

                # Add events to queue
                for e in events:
                    with self.lock:
                        self.events_queue.put(e)


                time.sleep(0.1)

                # Update previous readings
                self.mpu6050.update_readings(ax, ay, az, pitch)

        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()

    # Set up
    def start(self):
        if not self.running:
            self.running = True
            self.thread = Thread(target=self._monitor_loop, daemon=True)
            print("Done! Starting program.")
            self.thread.start()


    def get_events(self):
        events = []
        while not self.events_queue.empty():
            with self.lock:
                events.append(self.events_queue.get())
        return events


    # Tear down
    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()  # wait for the monitoring thread to exit
        self.cleanup()

    def cleanup(self):
        self.buzzer.buzzer_pwm.stop()
        GPIO.cleanup()
        self.running = False
