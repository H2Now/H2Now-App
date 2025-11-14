import time
from hx711 import HX711

class LoadCell:
    def __init__(self):
        # GPIO Pins
        self.DT_PIN = 5
        self.SCK_PIN = 6
        self.hx = HX711(self.DT_PIN, self.SCK_PIN)

        # Weight calibration, used 500g
        self.REFERENCE_UNIT = 203.4 
        self.hx.set_reference_unit(self.REFERENCE_UNIT)
        self.hx.set_reading_format("MSB", "MSB")
        self.hx.reset()
        self.hx.tare()

        # Threshold values (grams / ml)
        self.WEIGHT_CHANGE_THRESHOLD = 5

        # State variables
        self.prev_weight = self.read_weight()

    
    # Get average from 5 samples (raw)
    def read_raw_weight(self, samples=5):
        total = 0
        for _ in range(samples):
            total += self.hx.get_value()  # raw ADC reading
            time.sleep(0.01)
        average = total / samples
        return average
    

    # Convert into grams / ml
    def read_weight(self):
        weight = self.read_raw_weight(5) / self.REFERENCE_UNIT
        return weight
    

    # Detect if any changes in water weight 
    def detect_weight_change(self, curr_weight):
        weight_diff = abs(curr_weight - self.prev_weight)

        if curr_weight < self.prev_weight and weight_diff >= self.WEIGHT_CHANGE_THRESHOLD:
            print(weight_diff, "ml of water was drunk!")
            return True
        else:
            print("No water was drunk!")
            return False
