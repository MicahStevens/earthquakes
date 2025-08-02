"""Simple earthquake visualization app using USGS data."""

import eel
import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import time

# Initialize Eel with the web folder
eel.init('web')

# Cache directory for earthquake data
CACHE_DIR = "cache"
CACHE_DURATION = 3600  # 1 hour in seconds

def ensure_cache_dir() -> None:
    """Ensure cache directory exists."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

def get_cache_filename(feed_url: str) -> str:
    """Generate cache filename from feed URL."""
    # Create a simple hash of the URL for filename
    import hashlib
    url_hash = hashlib.md5(feed_url.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"earthquake_data_{url_hash}.json")

def is_cache_valid(cache_file: str) -> bool:
    """Check if cache file exists and is still valid."""
    if not os.path.exists(cache_file):
        return False
    
    file_age = time.time() - os.path.getmtime(cache_file)
    return file_age < CACHE_DURATION

@eel.expose
def fetch_earthquake_data(feed_type: str = "all_day") -> Dict[str, Any]:
    """
    Fetch earthquake data from USGS API with caching.
    
    Args:
        feed_type: Type of feed (all_day, all_week, all_month, etc.)
    
    Returns:
        GeoJSON data containing earthquake information
    """
    ensure_cache_dir()
    
    # USGS earthquake feed URLs (actual available feeds)
    feed_urls = {
        "significant_hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson",
        "significant_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson",
        "significant_week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson",
        "significant_month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
        "4.5_hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson",
        "4.5_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
        "4.5_week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
        "4.5_month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson",
        "2.5_hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson",
        "2.5_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
        "2.5_week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson",
        "2.5_month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson",
        "1.0_hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_hour.geojson",
        "1.0_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson",
        "1.0_week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson",
        "1.0_month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson",
        "all_hour": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
        "all_day": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        "all_week": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        "all_month": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
    }
    
    if feed_type not in feed_urls:
        return {"error": f"Invalid feed type: {feed_type}"}
    
    feed_url = feed_urls[feed_type]
    cache_file = get_cache_filename(feed_url)
    
    # Check cache first
    if is_cache_valid(cache_file):
        try:
            with open(cache_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # Cache file is corrupted, proceed to fetch fresh data
            pass
    
    # Fetch fresh data
    try:
        response = requests.get(feed_url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Cache the data
        with open(cache_file, 'w') as f:
            json.dump(data, f)
        
        return data
    except requests.RequestException as e:
        return {"error": f"Failed to fetch earthquake data: {str(e)}"}

@eel.expose
def get_available_feeds() -> List[str]:
    """Get list of available earthquake feed types."""
    return [
        "significant_hour", "significant_day", "significant_week", "significant_month",
        "4.5_hour", "4.5_day", "4.5_week", "4.5_month",
        "2.5_hour", "2.5_day", "2.5_week", "2.5_month",
        "1.0_hour", "1.0_day", "1.0_week", "1.0_month",
        "all_hour", "all_day", "all_week", "all_month"
    ]

if __name__ == "__main__":
    try:
        eel.start('index.html', size=(1200, 800), port=8080)
    except (SystemExit, MemoryError, KeyboardInterrupt):
        # Handle clean shutdown
        pass
