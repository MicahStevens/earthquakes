class EarthquakeVisualization {
    constructor() {
        this.map = null;
        this.earthquakeData = null;
        this.currentMarkers = [];
        this.animationIndex = 0;
        this.isPlaying = false;
        this.animationSpeed = 1;
        this.animationInterval = null;
        this.sortedEarthquakes = [];
        
        this.initializeMap();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initializeMap() {
        // Initialize the map centered on Pacific Rim
        this.map = L.map('map').setView([0, -160], 3);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Add legend
        this.addLegend();
    }

    addLegend() {
        const legend = L.control({position: 'bottomright'});
        
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = `
                <h4>Magnitude</h4>
                <i class="magnitude-low"></i> 0.0 - 2.9<br>
                <i class="magnitude-medium"></i> 3.0 - 4.9<br>
                <i class="magnitude-high"></i> 5.0 - 6.9<br>
                <i class="magnitude-extreme"></i> 7.0+<br>
            `;
            return div;
        };
        
        legend.addTo(this.map);
    }

    setupEventListeners() {
        // Feed selection
        document.getElementById('feedSelect').addEventListener('change', () => {
            this.loadEarthquakeData();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadEarthquakeData();
        });

        // Animation controls
        document.getElementById('playBtn').addEventListener('click', () => {
            this.startAnimation();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseAnimation();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetAnimation();
        });

        // Speed control
        document.getElementById('speedControl').addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            this.updateSpeedDisplay();
            
            if (this.isPlaying) {
                this.pauseAnimation();
                this.startAnimation();
            }
        });
    }

    updateSpeedDisplay() {
        const speed = this.animationSpeed;
        document.getElementById('speedValue').textContent = `${speed}h/s`;
    }

    async loadInitialData() {
        this.updateSpeedDisplay();
        await this.loadEarthquakeData();
    }

    async loadEarthquakeData() {
        const loadingEl = document.getElementById('loading');
        const feedType = document.getElementById('feedSelect').value;
        
        loadingEl.classList.remove('hidden');
        
        try {
            const data = await eel.fetch_earthquake_data(feedType)();
            
            if (data.error) {
                alert(`Error loading data: ${data.error}`);
                return;
            }
            
            this.earthquakeData = data;
            this.processEarthquakeData();
            this.resetAnimation();
            
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            loadingEl.classList.add('hidden');
        }
    }

    processEarthquakeData() {
        if (!this.earthquakeData || !this.earthquakeData.features) {
            return;
        }

        // Sort earthquakes by time
        this.sortedEarthquakes = this.earthquakeData.features
            .map(feature => ({
                ...feature,
                time: new Date(feature.properties.time)
            }))
            .sort((a, b) => a.time - b.time);

        document.getElementById('earthquakeCount').textContent = 
            `Earthquakes: ${this.sortedEarthquakes.length}`;
    }

    getMarkerStyle(magnitude) {
        let color, size;
        
        if (magnitude < 3.0) {
            color = '#ffeb3b'; // Yellow
            size = 8;
        } else if (magnitude < 5.0) {
            color = '#ff9800'; // Orange
            size = 12;
        } else if (magnitude < 7.0) {
            color = '#f44336'; // Red
            size = 16;
        } else {
            color = '#9c27b0'; // Purple
            size = 20;
        }

        return {
            color: 'white',
            fillColor: color,
            fillOpacity: 0.8,
            radius: size,
            weight: 2
        };
    }

    createEarthquakeMarker(earthquake) {
        const coords = earthquake.geometry.coordinates;
        const magnitude = earthquake.properties.mag;
        const place = earthquake.properties.place;
        const time = new Date(earthquake.properties.time);
        
        const marker = L.circleMarker([coords[1], coords[0]], this.getMarkerStyle(magnitude));
        
        marker.bindPopup(`
            <strong>Magnitude: ${magnitude}</strong><br>
            <strong>Location:</strong> ${place}<br>
            <strong>Time:</strong> ${time.toLocaleString()}<br>
            <strong>Depth:</strong> ${coords[2]} km
        `);
        
        return marker;
    }

    startAnimation() {
        if (!this.sortedEarthquakes.length) {
            alert('No earthquake data loaded');
            return;
        }

        this.isPlaying = true;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;

        // Calculate time span of earthquake data
        const firstTime = this.sortedEarthquakes[0].time.getTime();
        const lastTime = this.sortedEarthquakes[this.sortedEarthquakes.length - 1].time.getTime();
        const totalTimeSpanMs = lastTime - firstTime;
        
        // Calculate how much real time each animation step should represent
        // animationSpeed is in hours per second
        const realTimePerSecond = this.animationSpeed * 60 * 60 * 1000; // Convert to milliseconds
        const animationDurationSeconds = totalTimeSpanMs / realTimePerSecond;
        const intervalMs = Math.max(10, (animationDurationSeconds * 1000) / this.sortedEarthquakes.length);
        
        this.animationInterval = setInterval(() => {
            if (this.animationIndex >= this.sortedEarthquakes.length) {
                this.pauseAnimation();
                return;
            }

            const earthquake = this.sortedEarthquakes[this.animationIndex];
            const marker = this.createEarthquakeMarker(earthquake);
            
            marker.addTo(this.map);
            this.currentMarkers.push(marker);

            // Update time display
            document.getElementById('timeDisplay').textContent = 
                `Time: ${earthquake.time.toLocaleString()}`;

            this.animationIndex++;
        }, intervalMs);
    }

    pauseAnimation() {
        this.isPlaying = false;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    resetAnimation() {
        this.pauseAnimation();
        
        // Clear all markers
        this.currentMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.currentMarkers = [];
        
        this.animationIndex = 0;
        
        // Reset displays
        document.getElementById('timeDisplay').textContent = 'Time: --';
        
        if (this.sortedEarthquakes.length > 0) {
            document.getElementById('earthquakeCount').textContent = 
                `Earthquakes: ${this.sortedEarthquakes.length}`;
        }
    }

    showAllEarthquakes() {
        this.resetAnimation();
        
        this.sortedEarthquakes.forEach(earthquake => {
            const marker = this.createEarthquakeMarker(earthquake);
            marker.addTo(this.map);
            this.currentMarkers.push(marker);
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EarthquakeVisualization();
});