# Update system
sudo apt update && sudo apt upgrade -y

# Install required Python libraries
sudo apt install python3-pip python3-gpio -y

# Enable I2C interface for LCD
sudo raspi-config
# Navigate to Interface Options → I2C → Enable

# Install I2C tools and Python libraries
sudo apt install -y i2c-tools
pip3 install RPi.GPIO smbus2 lcddriver

# Alternative I2C LCD library
pip3 install adafruit-circuitpython-charlcd adafruit-blinka

# For I2C LCD control
pip3 install RPLCD

# For data logging and analysis
pip3 install pandas datetime sqlite3

# Check I2C connection (find LCD address)
sudo i2cdetect -y 1
# Should show address like 0x27 or 0x3f

# Make the script executable
chmod +x focus_controller.py

# Run the main program
python3 focus_controller.py

# View statistics (in another terminal)
python3 view_stats.py

# In the FocusZoneController class
self.focus_threshold = 10  # Adjust sensitivity (cm)
session_timeout = 120      # Adjust session end timeout (seconds)
led_brightness_max = 100   # Maximum LED brightness

# Install pygame for sound
pip3 install pygame

# Add to code
import pygame
pygame.mixer.init()

def play_focus_sound():
    pygame.mixer.Sound('focus_start.wav').play()
