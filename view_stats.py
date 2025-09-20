#!/usr/bin/env python3
import sqlite3
import pandas as pd
from datetime import datetime, timedelta

def view_focus_stats():
    conn = sqlite3.connect('focus_sessions.db')
    
    # Get all sessions
    df = pd.read_sql_query("SELECT * FROM sessions ORDER BY date DESC, start_time DESC", conn)
    
    if df.empty:
        print("No focus sessions recorded yet!")
        return
    
    print("\n=== FOCUS ZONE STATISTICS ===")
    print(f"Total Sessions: {len(df)}")
    print(f"Total Focus Time: {df['duration_minutes'].sum()} minutes")
    print(f"Average Session Length: {df['duration_minutes'].mean():.1f} minutes")
    print(f"Average Focus Percentage: {df['focus_percentage'].mean():.1f}%")
    print(f"Total Distractions: {df['distraction_count'].sum()}")
    
    print("\n=== RECENT SESSIONS ===")
    for _, session in df.head(10).iterrows():
        print(f"{session['date']} {session['start_time']}: {session['duration_minutes']}m, {session['focus_percentage']:.1f}% focus")
    
    conn.close()

if __name__ == "__main__":
    view_focus_stats()
