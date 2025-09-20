#!/usr/bin/env python3
import RPi.GPIO as GPIO
import time
import sqlite3
import json
from datetime import datetime, timedelta
from rpi_lcd import LCD

# GPIO Pin Setup
MOTION_PIN_DO = 18  # Digital output from PIR
MOTION_PIN_AO = 4   # Analog output from PIR (optional)
TRIG_PIN = 24
ECHO_PIN = 23
LED_PIN = 21

# LCD Setup
lcd = LCD()

# Initialize GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(MOTION_PIN_DO, GPIO.IN)
GPIO.setup(MOTION_PIN_AO, GPIO.IN)  # Optional analog input
GPIO.setup(TRIG_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)
GPIO.setup(LED_PIN, GPIO.OUT)

# PWM for LED brightness control
led_pwm = GPIO.PWM(LED_PIN, 1000)  # 1kHz frequency
led_pwm.start(0)  # Start with LED off

class FocusZoneController:
    def __init__(self):
        self.session_start = None
        self.session_end = None
        self.focus_level = 0
        self.total_focus_time = 0
        self.distraction_count = 0
        self.baseline_distance = None
        self.is_session_active = False
        self.last_distance_check = time.time()
        self.focus_threshold = 10  # cm difference from baseline
        
        # Initialize database
        self.init_database()
        
        # Motivational messages
        self.focus_messages = [
            "Stay focused!",
            "You're doing great!",
            "Deep work mode",
            "In the zone!",
            "Concentration time"
        ]
        
        self.distraction_messages = [
            "Come back to work",
            "Focus time!",
            "Lean forward",
            "Back to task",
            "Stay on track"
        ]
    
    def init_database(self):
        """Initialize SQLite database for tracking sessions"""
        self.conn = sqlite3.connect('focus_sessions.db')
        self.cursor = self.conn.cursor()
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                start_time TEXT,
                end_time TEXT,
                duration_minutes INTEGER,
                focus_percentage REAL,
                distraction_count INTEGER
            )
        ''')
        self.conn.commit()
    
    def get_distance(self):
        """Get distance from ultrasonic sensor"""
        # Clear trigger
        GPIO.output(TRIG_PIN, False)
        time.sleep(0.01)
        
        # Send trigger pulse
        GPIO.output(TRIG_PIN, True)
        time.sleep(0.00001)
        GPIO.output(TRIG_PIN, False)
        
        # Wait for echo
        pulse_start = time.time()
        pulse_end = time.time()
        
        timeout = time.time() + 0.1  # 100ms timeout
        
        while GPIO.input(ECHO_PIN) == 0 and time.time() < timeout:
            pulse_start = time.time()
        
        while GPIO.input(ECHO_PIN) == 1 and time.time() < timeout:
            pulse_end = time.time()
        
        if time.time() >= timeout:
            return None
        
        # Calculate distance
        pulse_duration = pulse_end - pulse_start
        distance = pulse_duration * 17150  # Speed of sound / 2
        return round(distance, 2)
    
    def detect_motion(self):
        """Check if motion is detected using digital output"""
        return GPIO.input(MOTION_PIN_DO)
    
    def get_motion_intensity(self):
        """Get motion intensity from analog output (optional advanced feature)"""
        # This would require an ADC like MCP3008 for true analog reading
        # For now, we'll use digital reading with timing for intensity estimation
        motion_start = time.time()
        motion_count = 0
        
        # Count motion pulses over 1 second to estimate intensity
        while time.time() - motion_start < 1:
            if GPIO.input(MOTION_PIN_DO):
                motion_count += 1
            time.sleep(0.01)
        
        return motion_count  # Higher count = more motion/intensity
    
    def calibrate_baseline(self):
        """Calibrate the user's normal sitting position"""
        lcd.text("Calibrating...", 1)
        lcd.text("Sit normally", 2)
        time.sleep(3)
        
        distances = []
        for i in range(10):
            dist = self.get_distance()
            if dist:
                distances.append(dist)
            time.sleep(0.5)
        
        if distances:
            self.baseline_distance = sum(distances) / len(distances)
            lcd.clear()
            lcd.text(f"Baseline: {self.baseline_distance:.1f}cm", 1)
            time.sleep(2)
            return True
        return False
    
    def calculate_focus_level(self):
        """Calculate focus level based on posture"""
        current_distance = self.get_distance()
        if not current_distance or not self.baseline_distance:
            return 50  # Default middle value
        
        distance_diff = self.baseline_distance - current_distance
        
        if distance_diff > self.focus_threshold:
            # User is leaning forward (focused)
            focus_score = min(100, 70 + (distance_diff - self.focus_threshold) * 2)
        elif distance_diff < -self.focus_threshold:
            # User is leaning back (distracted)
            focus_score = max(0, 30 + (distance_diff + self.focus_threshold) * 2)
        else:
            # User is in neutral position
            focus_score = 50
        
        return int(focus_score)
    
    def update_led_brightness(self):
        """Update LED brightness based on focus level"""
        brightness = int((self.focus_level / 100) * 100)  # 0-100 PWM duty cycle
        led_pwm.ChangeDutyCycle(brightness)
    
    def display_status(self):
        """Update LCD with current status"""
        if not self.is_session_active:
            lcd.text("Focus Zone Ready", 1)
            lcd.text("Sit down to start", 2)
        else:
            session_duration = int((time.time() - self.session_start) / 60)
            
            if self.focus_level > 70:
                message = self.focus_messages[session_duration % len(self.focus_messages)]
            else:
                message = self.distraction_messages[self.distraction_count % len(self.distraction_messages)]
            
            lcd.text(f"Focus: {self.focus_level}% T:{session_duration}m", 1)
            lcd.text(message[:16], 2)
    
    def start_session(self):
        """Start a new focus session"""
        if not self.calibrate_baseline():
            lcd.text("Calibration failed", 1)
            return False
        
        self.session_start = time.time()
        self.is_session_active = True
        self.focus_level = 50
        self.distraction_count = 0
        self.total_focus_time = 0
        
        lcd.clear()
        lcd.text("Session Started!", 1)
        time.sleep(2)
        return True
    
    def end_session(self):
        """End current focus session and save data"""
        if not self.is_session_active:
            return
        
        self.session_end = time.time()
        session_duration = int((self.session_end - self.session_start) / 60)
        focus_percentage = (self.total_focus_time / (self.session_end - self.session_start)) * 100
        
        # Save to database
        date_str = datetime.now().strftime("%Y-%m-%d")
        start_time_str = datetime.fromtimestamp(self.session_start).strftime("%H:%M:%S")
        end_time_str = datetime.fromtimestamp(self.session_end).strftime("%H:%M:%S")
        
        self.cursor.execute('''
            INSERT INTO sessions (date, start_time, end_time, duration_minutes, focus_percentage, distraction_count)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (date_str, start_time_str, end_time_str, session_duration, focus_percentage, self.distraction_count))
        
        self.conn.commit()
        
        # Display session summary
        lcd.clear()
        lcd.text(f"Session: {session_duration}m", 1)
        lcd.text(f"Focus: {focus_percentage:.1f}%", 2)
        time.sleep(5)
        
        self.is_session_active = False
        led_pwm.ChangeDutyCycle(0)  # Turn off LED
    
    def run(self):
        """Main application loop"""
        print("Focus Zone Controller Started!")
        lcd.clear()
        
        try:
            while True:
                motion_detected = self.detect_motion()
                
                if motion_detected and not self.is_session_active:
                    # Start new session
                    if self.start_session():
                        continue
                
                if self.is_session_active:
                    # Update focus level every 5 seconds
                    if time.time() - self.last_distance_check > 5:
                        old_focus = self.focus_level
                        self.focus_level = self.calculate_focus_level()
                        
                        # Track focus time
                        if self.focus_level > 60:
                            self.total_focus_time += 5
                        elif self.focus_level < 40:
                            self.distraction_count += 1
                        
                        self.last_distance_check = time.time()
                        self.update_led_brightness()
                    
                    # Check for session end (no motion for 2 minutes)
                    if not motion_detected:
                        no_motion_start = time.time()
                        while time.time() - no_motion_start < 120:  # 2 minutes
                            if self.detect_motion():
                                break
                            time.sleep(1)
                        else:
                            self.end_session()
                            continue
                
                self.display_status()
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\nShutting down Focus Zone Controller...")
            if self.is_session_active:
                self.end_session()
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        lcd.clear()
        led_pwm.stop()
        GPIO.cleanup()
        self.conn.close()

if __name__ == "__main__":
    controller = FocusZoneController()
    controller.run()
