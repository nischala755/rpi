PIR Motion Sensor (4-pin):
- VCC → 5V (Pin 2)
- GND → GND (Pin 6)
- DO → GPIO 18 (Pin 12) - Digital Output
- AO → GPIO 4 (Pin 7) - Analog Output (optional for sensitivity)

Ultrasonic Sensor (HC-SR04):
- VCC → 5V (Pin 4)
- GND → GND (Pin 14)
- Trig → GPIO 24 (Pin 18)
- Echo → GPIO 23 (Pin 16)

LCD Display (16x2):
- VSS → GND (Pin 20)
- VDD → 3.3V (Pin 1)
- V0 → 10kΩ potentiometer for contrast
- RS → GPIO 26 (Pin 37)
- Enable → GPIO 19 (Pin 35)
- D4 → GPIO 13 (Pin 33)
- D5 → GPIO 6 (Pin 31)
- D6 → GPIO 5 (Pin 29)
- D7 → GPIO 11 (Pin 23)
- A → 3.3V (backlight)
- K → GND (backlight)

LED:
- Anode → GPIO 21 (Pin 40) via 220Ω resistor
- Cathode → GND (Pin 39)
# Update system
sudo apt update && sudo apt upgrade -y

# Install required Python libraries
sudo apt install python3-pip python3-gpio -y
pip3 install RPi.GPIO adafruit-circuitpython-charlcd adafruit-blinka

# Enable GPIO interface
sudo raspi-config
# Navigate to Interface Options → GPIO → Enable

# For LCD control (alternative method)
pip3 install rpi_lcd

# For data logging and analysis
pip3 install pandas datetime sqlite3

#run
# Make the script executable
chmod +x focus_controller.py

# Run the main program
python3 focus_controller.py

# View statistics (in another terminal)
python3 view_stats.py

#adjust
# In the FocusZoneController class
self.focus_threshold = 10  # Adjust sensitivity (cm)
session_timeout = 120      # Adjust session end timeout (seconds)
led_brightness_max = 100   # Maximum LED brightness
#sound
# Install pygame for sound
pip3 install pygame

# Add to code
import pygame
pygame.mixer.init()

def play_focus_sound():
    pygame.mixer.Sound('focus_start.wav').play()

