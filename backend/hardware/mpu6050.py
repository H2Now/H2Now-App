import smbus
import time
import math

class MPU6050:
    def __init__(self):
        # Registers
        self.PWR_MGMT_1   = 0x6B
        self.ACCEL_XOUT_H = 0x3B
        self.ACCEL_YOUT_H = 0x3D
        self.ACCEL_ZOUT_H = 0x3F

        # I2C
        self.bus = smbus.SMBus(1)
        self.Device_Address = 0x68
        self.bus.write_byte_data(self.Device_Address, self.PWR_MGMT_1, 0)

        # Thresholds
        self.ACCEL_THRESHOLD = 0.5   
        self.TILT_THRESHOLD = 5     
        self.DRINK_ANGLE_MIN = 20    
        self.DRINK_ANGLE_MAX = 80    
        self.DRINK_HOLD_TIME = 1.0   
        self.STILL_TIME  = 2.0          # For placement and drinking
        self.INACTIVE_TIME = 60.0       # For time after placement before buzzer
        self.PLACED_ANGLE_MAX  = 15    
        self.PLACED_CONFIRM = 1.0  

        # State variables
        self.prev_ax, self.prev_ay, self.prev_az = self.read_accel()
        self.prev_pitch = self.tilt_angles(self.prev_ax, self.prev_ay, self.prev_az)
        self.drinking = False
        self.placed_bottle_timestamp = None # When bottle was confirmed placed
        self.bottle_picked = False


    # Read in accel from MPU (raw)
    def read_raw_accel(self, addr):
        high = self.bus.read_byte_data(self.Device_Address, addr)
        low  = self.bus.read_byte_data(self.Device_Address, addr+1)
        value = (high << 8) | low
        
        if value > 32767:
            value -= 65536
        return value


    # Convert into readable format
    def read_accel(self):
        ax = self.read_raw_accel(self.ACCEL_XOUT_H) / 16384.0
        ay = self.read_raw_accel(self.ACCEL_YOUT_H) / 16384.0
        az = self.read_raw_accel(self.ACCEL_ZOUT_H) / 16384.0
        return ax, ay, az


    # Get angle of MPU
    def tilt_angles(self, ax, ay, az):
        pitch = math.atan2(ax, math.sqrt(ay**2 + az**2)) * 180 / math.pi
        return pitch
    

    # Detect any acceleration change
    def detect_accel_change(self, ax, ay, az):
        accel_change = (
            abs(ax - self.prev_ax) > self.ACCEL_THRESHOLD or
            abs(ay - self.prev_ay) > self.ACCEL_THRESHOLD or
            abs(az - self.prev_az) > self.ACCEL_THRESHOLD
        )

        print("Detected movement! Assuming user is picking up bottle.")
        self.bottle_picked = True

        return accel_change
    

    # Determine whether bottle was placed down for certain time
    def detect_bottle_placement(self, curr_time, last_movement_time):
        if self.bottle_picked and curr_time - last_movement_time > self.STILL_TIME:
            if self.placed_bottle_timestamp is None:
                self.placed_bottle_timestamp = curr_time

            elif curr_time - self.placed_bottle_timestamp >= self.PLACED_CONFIRM:
                print("Bottle has been placed down!")
                self.bottle_picked = False
                self.drinking = False
                self.placed_bottle_timestamp = curr_time
                return True
            
        return False