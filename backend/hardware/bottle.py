import smbus
import time
import math
import RPi.GPIO as GPIO
from threading import Thread

# PLEASE KNOW THAT SMBUS CANNOT BE INSTALLED WITHOUT A LINUX ENVIRONMENT.
# MAC WILL NOT RUN THIS — ONLY PI AND LAPTOPS WITH LINUX.

class BottleHardware:
    def __init__(self):
        # Buzzer setup 
        self.BUZZER_PIN = 18
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.BUZZER_PIN, GPIO.OUT)
        self.buzzer_pwm = GPIO.PWM(self.BUZZER_PIN, 4000)

        # MPU6050 Registers
        self.PWR_MGMT_1 = 0x6B
        self.ACCEL_XOUT_H = 0x3B
        self.ACCEL_YOUT_H = 0x3D
        self.ACCEL_ZOUT_H = 0x3F

        # Setup I2C
        self.bus = smbus.SMBus(1)
        self.Device_Address = 0x68

        # Wake up MPU6050
        self.bus.write_byte_data(self.Device_Address, self.PWR_MGMT_1, 0)

        # Thresholds
        self.ACCEL_THRESHOLD = 0.5
        self.TILT_THRESHOLD = 5
        self.DRINK_ANGLE_MIN = 40
        self.DRINK_ANGLE_MAX = 80
        self.DRINK_HOLD_TIME = 1.0
        self.STILL_TIME = 2.0
        self.PLACED_ANGLE_MAX = 15
        self.PLACED_CONFIRM = 1.0
        self.INACTIVE_TIME = 5.0

        # State tracking
        self.prev_ax, self.prev_ay, self.prev_az = self.read_accel()
        self.prev_pitch = self.tilt_angles(self.prev_ax, self.prev_ay, self.prev_az)
        self.bottle_picked = False
        self.drinking = False
        self.drink_start_time = None
        self.last_motion_time = time.time()
        self.placed_candidate_time = None
        self.placed_time = None
        self.running = False
        self.thread = None

    def read_raw_accel(self, addr):
        high = self.bus.read_byte_data(self.Device_Address, addr)
        low = self.bus.read_byte_data(self.Device_Address, addr + 1)
        value = (high << 8) | low
        if value > 32767:
            value -= 65536
        return value

    def read_accel(self):
        ax = self.read_raw_accel(self.ACCEL_XOUT_H) / 16384.0
        ay = self.read_raw_accel(self.ACCEL_YOUT_H) / 16384.0
        az = self.read_raw_accel(self.ACCEL_ZOUT_H) / 16384.0
        return ax, ay, az

    def tilt_angles(self, ax, ay, az):
        pitch = math.atan2(ax, math.sqrt(ay ** 2 + az ** 2)) * 180 / math.pi
        return pitch

    def buzzer_alert(self):
        self.buzzer_pwm.start(50)
        time.sleep(2)
        self.buzzer_pwm.stop()

    def bottle_monitor(self):
        try:
            while self.running:
                ax, ay, az = self.read_accel()
                pitch = self.tilt_angles(ax, ay, az)
                now = time.time()

                accel_change = (
                    abs(ax - self.prev_ax) > self.ACCEL_THRESHOLD or
                    abs(ay - self.prev_ay) > self.ACCEL_THRESHOLD or
                    abs(az - self.prev_az) > self.ACCEL_THRESHOLD
                )
                tilt_change = abs(pitch - self.prev_pitch) > self.TILT_THRESHOLD

                # Movement detection
                if accel_change or tilt_change:
                    self.last_motion_time = now
                    self.placed_candidate_time = None
                    self.placed_time = None
                    if not self.bottle_picked:
                        self.bottle_picked = True
                        print("Bottle is picked up")

                # Check for placement
                if (self.bottle_picked and
                    now - self.last_motion_time > self.STILL_TIME and
                    abs(pitch) < self.PLACED_ANGLE_MAX):

                    if self.placed_candidate_time is None:
                        self.placed_candidate_time = now
                    elif now - self.placed_candidate_time >= self.PLACED_CONFIRM:
                        self.bottle_picked = False
                        self.drinking = False
                        self.drink_start_time = None
                        self.placed_candidate_time = None
                        self.placed_time = now
                        print("Bottle is placed down")
                else:
                    self.placed_candidate_time = None

                # Drinking detection
                if self.bottle_picked:
                    if self.DRINK_ANGLE_MIN <= abs(pitch) <= self.DRINK_ANGLE_MAX:
                        if not self.drinking:
                            if self.drink_start_time is None:
                                self.drink_start_time = now
                            elif now - self.drink_start_time >= self.DRINK_HOLD_TIME:
                                self.drinking = True
                                print("Drinking detected!")
                    else:
                        self.drink_start_time = None
                        if self.drinking:
                            self.drinking = False
                            print("Stopped drinking")

                # Inactivity alert
                if self.placed_time and (now - self.placed_time) >= self.INACTIVE_TIME:
                    print("Please drink your water!")
                    self.buzzer_alert()
                    self.placed_time = now

                # Update previous readings
                self.prev_ax, self.prev_ay, self.prev_az = ax, ay, az
                self.prev_pitch = pitch
                time.sleep(0.1)

        except KeyboardInterrupt:
            pass
        finally:
            self.buzzer_pwm.stop()
            GPIO.cleanup()

    def start(self):
        if not self.running:
            self.running = True
            self.thread = Thread(target=self.bottle_monitor, daemon=True)
            self.thread.start()
            print("Bottle monitoring started.")

    def stop(self):
        if self.running:
            self.running = False
            if self.thread:
                self.thread.join()
            self.buzzer_pwm.stop()
            GPIO.cleanup()
            print("Bottle monitoring stopped.")

