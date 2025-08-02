# Earthquake Visualization App

A real-time earthquake visualization application that fetches data from the USGS Earthquake API and displays it on an interactive map with time-series animation capabilities.

![Screenshot](/home/micah/Code/earthquakes/screenshot.png)

## Project Goals

- **Real-time Data Visualization**: Display earthquake data from the USGS on an interactive map
- **Time-series Animation**: Animate earthquakes chronologically to show seismic activity patterns
- **Pacific Rim Focus**: Optimized view for earthquake-prone regions around the Pacific Ocean
- **Intuitive Controls**: Simple play/pause/speed controls for analyzing earthquake patterns
- **Data Caching**: Efficient local caching to minimize API calls and improve performance

## Features

### Data & Visualization
- **Live USGS Data**: Fetches earthquake data from official USGS GeoJSON feeds
- **Interactive Map**: Leaflet.js map with zoom, pan, and marker interaction
- **Visual Encoding**: 
  - **Circle Size**: Proportional to earthquake magnitude
  - **Color Coding**: 
    - =á Yellow (M0.0-2.9): Minor earthquakes
    - =à Orange (M3.0-4.9): Light earthquakes  
    - =4 Red (M5.0-6.9): Moderate to strong earthquakes
    - =ã Purple (M7.0+): Major earthquakes
- **Detailed Popups**: Click markers to see magnitude, location, time, and depth

### Animation Controls
- **Play/Pause/Reset**: Standard media controls for earthquake playback
- **Speed Control**: 0.1 to 24 hours per second (e.g., 4h/s means 4 hours of earthquakes play in 1 second)
- **Real-time Display**: Shows current earthquake time during animation
- **Progress Tracking**: Live earthquake count and time updates

### Data Sources
Choose from multiple USGS earthquake feeds:

| Feed Type | Time Ranges Available |
|-----------|----------------------|
| **All Earthquakes** | Past Hour, Day, Week, 30 Days |
| **M1.0+ Earthquakes** | Past Hour, Day, Week, 30 Days |
| **M2.5+ Earthquakes** | Past Hour, Day, Week, 30 Days |
| **M4.5+ Earthquakes** | Past Hour, Day, Week, 30 Days |
| **Significant Earthquakes** | Past Hour, Day, Week, 30 Days |

### Performance
- **Local Caching**: 1-hour cache reduces API calls and improves load times
- **Optimized Animation**: Efficient rendering for smooth playback at high speeds
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites
- Python 3.8+
- [uv](https://github.com/astral-sh/uv) package manager

### Setup
1. Clone or download the project
2. Install dependencies:
```bash
uv add eel requests
```

## Usage

### Running the Application
```bash
uv run python main.py
```

The application will:
1. Start a local web server on port 8080
2. Automatically open your default browser to `http://localhost:8080`
3. Display the earthquake visualization interface

### Using the Interface

1. **Select Data Feed**: Choose earthquake magnitude threshold and time range from the dropdown
2. **Load Data**: Click "Refresh Data" to fetch the latest earthquake information
3. **Set Animation Speed**: Use the slider to choose playback speed (0.1-24 hours per second)
4. **Control Playback**: Use Play/Pause/Reset buttons to control the animation
5. **Explore Map**: Zoom, pan, and click on earthquake markers for detailed information

### Example Workflows

**Daily Earthquake Patterns**:
1. Select "M2.5+ - Past Day"
2. Set speed to 1h/s (1 hour per second)
3. Press Play to watch 24 hours of earthquakes in 24 seconds

**Weekly Pacific Rim Activity**:
1. Select "M4.5+ - Past Week" 
2. Set speed to 12h/s (12 hours per second)
3. Press Play to see a week of significant earthquakes in ~14 seconds

**Monthly Major Earthquake Overview**:
1. Select "Significant - Past 30 Days"
2. Set speed to 24h/s (1 day per second)
3. Press Play to review a month of major earthquakes in 30 seconds

## Technical Implementation

### Architecture
- **Backend**: Python with Eel framework for desktop app functionality
- **Frontend**: HTML/CSS/JavaScript with Leaflet.js for mapping
- **Data**: USGS Earthquake Hazards Program GeoJSON API
- **Caching**: Local file-based cache with 1-hour TTL

### Key Components
- `main.py`: Python backend with Eel integration and USGS API client
- `web/index.html`: Main application interface
- `web/app.js`: Animation logic and map controls
- `web/style.css`: Responsive styling and visual design

### Data Flow
1. User selects earthquake feed type
2. Python backend checks local cache
3. If cache miss, fetches fresh data from USGS API
4. Data is cached locally and returned to frontend
5. JavaScript processes GeoJSON and creates Leaflet markers
6. Animation system plays earthquakes chronologically

## API Reference

The app uses the [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) real-time feeds:

- **Base URL**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/`
- **Format**: GeoJSON
- **Update Frequency**: Every minute
- **Geographic Coverage**: Global

## Contributing

To extend the application:
1. Follow the coding guidelines in `CLAUDE.md`
2. Use `uv` for dependency management
3. Test changes with realistic earthquake data
4. Ensure proper error handling for API failures

## License

This project uses publicly available USGS earthquake data and open-source libraries.