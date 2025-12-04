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
        self.ACCEL_THRESHOLD = 0.2 
        self.TILT_THRESHOLD = 5     
        self.DRINK_ANGLE_MIN = 20    
        self.DRINK_ANGLE_MAX = 80    
        self.DRINK_HOLD_TIME = 0.5   
        self.STILL_TIME  = 2.0          # For placement and drinking
        self.PLACED_ANGLE_MAX  = 15    
        self.PLACED_CONFIRM = 1.0  

        # Reminder settings
        self.reminder_freq_seconds = 60 * 60 
        self.bottle_alert_enabled = False

        # State variables
        self.prev_ax, self.prev_ay, self.prev_az = 0, 0, 0
        self.prev_pitch = 0
        self.drinking = False
        self.bottle_picked = False
        self.placed_bottle_timestamp = time.time() # When bottle was confirmed placed
        self.start_drink_timestamp = time.time() # WHen user first started to drink
        self.stop_drink_timestamp = None # When it seems like user has stopped drinking
        self.prev_movement_timestamp = time.time() # When user last moved bottle

    # Update reminder settings from backend
    def update_reminder_settings(self, reminder_freq_hours, bottle_alert_enabled):
        self.reminder_freq_seconds = reminder_freq_hours * 60 * 60
        self.bottle_alert_enabled = bottle_alert_enabled

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
    

    # Update prev state variables from MPU6050
    def update_readings(self, ax, ay, az, pitch):
        self.prev_ax, self.prev_ay, self.prev_az = ax, ay, az
        self.prev_pitch = pitch
    

    # Detect any acceleration change
    def detect_movement(self, ax, ay, az, now):
        accel_change = (
            abs(ax - self.prev_ax) > self.ACCEL_THRESHOLD or
            abs(ay - self.prev_ay) > self.ACCEL_THRESHOLD or
            abs(az - self.prev_az) > self.ACCEL_THRESHOLD
        )

        if not self.bottle_picked and accel_change:
            self.placed_bottle_timestamp = None
            self.prev_movement_timestamp = now
            self.bottle_picked = True
            print("Bottle is picked up")
            return True

        return None
    

    # Determine whether bottle was placed down for certain time
    def detect_bottle_placement(self, curr_time, pitch):
        if self.bottle_picked and curr_time - self.prev_movement_timestamp > self.STILL_TIME and abs(pitch) < self.DRINK_ANGLE_MIN:
            if self.placed_bottle_timestamp is None:
                self.placed_bottle_timestamp = curr_time

            elif curr_time - self.placed_bottle_timestamp >= self.PLACED_CONFIRM:
                print("Bottle has been placed down!")
                self.bottle_picked = False
                self.drinking = False
                self.placed_bottle_timestamp = curr_time
                return True
            
        return None
    

    # Determine whether the user is drinking (True) from the bottle or stopped (False)
    def detect_drinking(self, pitch, now):
        if self.bottle_picked:
            if (self.DRINK_ANGLE_MIN <= abs(pitch) <= self.DRINK_ANGLE_MAX):
                self.stop_drink_timestamp = None

                if self.start_drink_timestamp is None:
                    self.start_drink_timestamp = now
                elif now - self.start_drink_timestamp >= self.DRINK_HOLD_TIME:
                    self.drinking = True
                    print("Drinking detected!")
                    return True
            else:
                self.start_drink_timestamp = None

                if self.stop_drink_timestamp is None:
                    self.stop_drink_timestamp = now
                if self.drinking and now - self.stop_drink_timestamp >= self.STILL_TIME:
                    self.drinking = False
                    print("Stopped drinking")
                    return False
                
        return None
                
    
    # Detect inactivity with the bottle
    def detect_inactivity(self, now):
        if not self.bottle_alert_enabled:
            return False
        
        if self.placed_bottle_timestamp and (now - self.placed_bottle_timestamp) >= self.reminder_freq_seconds:
            print("Please drink your water!")
            self.placed_bottle_timestamp = now
            return True
        
        return False
