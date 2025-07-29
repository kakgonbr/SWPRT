import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Navigation, X } from 'lucide-react';

// Configuration constants
const API_URL = import.meta.env.VITE_MAPBOX_API_URL;
const MAP_URL = import.meta.env.VITE_MAPBOX_MAP_URL;
const API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const MAP_KEY = import.meta.env.VITE_MAPBOX_MAP_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const DIRECTION_VEHICLE = 'car';
const RADIUS_IN_METERS = 500;

console.log('API_URL:', API_URL);
console.log('MAP_URL:', MAP_URL);
console.log('API_KEY:', API_KEY);
console.log('MAP_KEY:', MAP_KEY);
console.log('ACCESS_TOKEN:', ACCESS_TOKEN);

interface Location {
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    address?: string;
}

interface MapboxMapProps {
    locations?: Location[];
    center?: [number, number];
    zoom?: number;
    height?: string;
}

interface SearchResult {
    place_id: string;
    description: string;
}

interface Coordinates {
    lat: number;
    lng: number;
}

// Define the methods that will be exposed via ref
export interface MapboxMapRef {
    setDirections: (startLocation: string, endLocation: string) => void;
}

const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(({
    locations = [],
    center = [105.85242472181584, 21.029579719995272],
    zoom = 14,
    height = '400px'
}, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showDirections, setShowDirections] = useState(false);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [startSuggestions, setStartSuggestions] = useState<SearchResult[]>([]);
    const [endSuggestions, setEndSuggestions] = useState<SearchResult[]>([]);
    const [showStartSuggestions, setShowStartSuggestions] = useState(false);
    const [showEndSuggestions, setShowEndSuggestions] = useState(false);
    const [mapStyle, setMapStyle] = useState('Normal');
    const [showStyleMenu, setShowStyleMenu] = useState(false);

    // Use refs for flags to prevent re-renders from affecting the logic
    const isProgrammaticFillRef = useRef(false);

    const mapStyles = [
        { name: 'Normal', url: `${MAP_URL}goong_map_web.json?api_key=${MAP_KEY}` },
        { name: 'Satellite', url: `${MAP_URL}goong_satellite.json?api_key=${MAP_KEY}` },
        { name: 'Dark', url: `${MAP_URL}goong_map_dark.json?api_key=${MAP_KEY}` },
        { name: 'Light', url: `${MAP_URL}navigation_day.json?api_key=${MAP_KEY}` },
        { name: 'Night', url: `${MAP_URL}navigation_night.json?api_key=${MAP_KEY}` }
    ];

    const fixedLocations = [
        { name: "Văn Miếu Quốc Tử Giám", coordinates: [105.8355, 21.0285] as [number, number] },
        { name: "Hồ Gươm", coordinates: [105.8545, 21.0289] as [number, number] },
        { name: "Lăng Bác", coordinates: [105.852, 21.0379] as [number, number] }
    ];

    // Exposed method to set directions from external components
    const setDirectionsFromExternal = (start: string, end: string) => {
        // Set flag to prevent autocomplete
        isProgrammaticFillRef.current = true;

        setStartLocation(start);
        setEndLocation(end);
        setShowDirections(true);

        // Clear any existing suggestions immediately
        setStartSuggestions([]);
        setEndSuggestions([]);
        setShowStartSuggestions(false);
        setShowEndSuggestions(false);

        // Reset flag after component updates
        setTimeout(() => {
            isProgrammaticFillRef.current = false;
        }, 500);
    };

    // Expose the method via useImperativeHandle
    useImperativeHandle(ref, () => ({
        setDirections: setDirectionsFromExternal
    }));

    useEffect(() => {
        if (!mapContainer.current) return;

        mapboxgl.accessToken = ACCESS_TOKEN;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: `${MAP_URL}goong_map_web.json?api_key=${MAP_KEY}`,
            zoom: zoom,
            center: center
        });

        // Add navigation control and position it properly to avoid overlap
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.scrollZoom.disable();

        map.current.on('load', () => {
            // Add fixed location markers (tourist attractions)
            fixedLocations.forEach(location => {
                const touristMarkerEl = document.createElement('div');
                touristMarkerEl.style.cssText = `
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    background-color: #8b5cf6;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                `;

                new mapboxgl.Marker({ element: touristMarkerEl })
                    .setLngLat(location.coordinates)
                    .setPopup(new mapboxgl.Popup().setText(location.name))
                    .addTo(map.current!);
            });

            // Add shop location markers from props
            locations.forEach(location => {
                const shopMarkerEl = document.createElement('div');
                shopMarkerEl.style.cssText = `
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background-color: #f59e0b;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    font-size: 12px;
                `;
                shopMarkerEl.textContent = 'S';

                new mapboxgl.Marker({ element: shopMarkerEl })
                    .setLngLat([location.coordinates.lng, location.coordinates.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <div>
                            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${location.name}</h3>
                            <p style="margin: 0; font-size: 12px;">${location.address || 'Shop Location'}</p>
                        </div>
                    `))
                    .addTo(map.current!);
            });

            // Don't add the default circle if we have shop locations
            if (locations.length === 0) {
                addCircle(center, RADIUS_IN_METERS);
            }
        });

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, [center, zoom, locations]);

    const drawCircle = (center: [number, number], radiusInMeters: number) => {
        const points = 74;
        const coords = {
            latitude: center[1],
            longitude: center[0]
        };
        const km = radiusInMeters / 1000;
        const ret = [];
        const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
        const distanceY = km / 110.574;
        let theta, x, y;
        for (let i = 0; i < points; i++) {
            theta = (i / points) * (2 * Math.PI);
            x = distanceX * Math.cos(theta);
            y = distanceY * Math.sin(theta);
            ret.push([coords.longitude + x, coords.latitude + y]);
        }
        ret.push(ret[0]);
        return ret;
    };

    const addCircle = (center: [number, number], radiusInMeters: number) => {
        if (!map.current) return;

        if (map.current.getLayer('circle')) {
            map.current.removeLayer('circle');
            map.current.removeSource('circle');
        }

        const circleData = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [drawCircle(center, radiusInMeters)]
                }
            }]
        };

        map.current.addSource('circle', {
            'type': 'geojson',
            'data': circleData as any
        });

        map.current.addLayer({
            'id': 'circle',
            'type': 'fill',
            'source': 'circle',
            'layout': {},
            'paint': {
                'fill-color': '#588888',
                'fill-opacity': 0.5
            }
        });
    };

    const fetchAutoComplete = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/Place/AutoComplete?api_key=${API_KEY}&input=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.predictions) {
                setSearchResults(data.predictions);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching autocomplete:', error);
            setSearchResults([]);
        }
    };

    // New function for fetching autocomplete suggestions for direction inputs
    const fetchDirectionAutoComplete = async (query: string, type: 'start' | 'end') => {
        // Don't fetch if programmatically filled
        if (isProgrammaticFillRef.current) {
            return;
        }

        if (query.length < 2) {
            if (type === 'start') {
                setStartSuggestions([]);
                setShowStartSuggestions(false);
            } else {
                setEndSuggestions([]);
                setShowEndSuggestions(false);
            }
            return;
        }

        try {
            const response = await fetch(`${API_URL}/Place/AutoComplete?api_key=${API_KEY}&input=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.predictions) {
                if (type === 'start') {
                    setStartSuggestions(data.predictions);
                    setShowStartSuggestions(true);
                } else {
                    setEndSuggestions(data.predictions);
                    setShowEndSuggestions(true);
                }
            } else {
                if (type === 'start') {
                    setStartSuggestions([]);
                    setShowStartSuggestions(false);
                } else {
                    setEndSuggestions([]);
                    setShowEndSuggestions(false);
                }
            }
        } catch (error) {
            console.error('Error fetching direction autocomplete:', error);
            if (type === 'start') {
                setStartSuggestions([]);
                setShowStartSuggestions(false);
            } else {
                setEndSuggestions([]);
                setShowEndSuggestions(false);
            }
        }
    };

    const fetchPlaceDetails = async (placeId: string) => {
        try {
            const response = await fetch(`${API_URL}/Place/Detail?api_key=${API_KEY}&place_id=${placeId}`);
            const data = await response.json();
            if (data.result && map.current) {
                const { location } = data.result.geometry;
                const lngLat: [number, number] = [location.lng, location.lat];

                new mapboxgl.Marker()
                    .setLngLat(lngLat)
                    .addTo(map.current);

                addCircle(lngLat, RADIUS_IN_METERS);
                map.current.flyTo({ center: lngLat, zoom: zoom });
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    };

    // Helper function to check if input is already coordinates (lat,lng format)
    const isLatLongFormat = (input: string): boolean => {
        const latLongRegex = /^-?([1-8]?[1-9]|[1-9]0)\.?\d*,\s?-?((1[0-7][0-9])|[1-9]?\d)\.?\d*$/;
        return latLongRegex.test(input.trim());
    };

    // Convert address to coordinates using Goong Geocoding API
    const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
        try {
            // Check if input is already in lat,lng format
            if (isLatLongFormat(address)) {
                const [lat, lng] = address.split(',').map(coord => parseFloat(coord.trim()));
                return { lat, lng };
            }

            // Use Goong Geocoding API to convert address to coordinates
            const response = await fetch(`${API_URL}/Geocode?address=${encodeURIComponent(address)}&api_key=${API_KEY}`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return { lat: location.lat, lng: location.lng };
            }

            return null;
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    };

    const handleSearchResultClick = (result: SearchResult) => {
        fetchPlaceDetails(result.place_id);
        setSearchTerm(result.description);
        setSearchResults([]);
    };

    // Handlers for direction suggestion clicks
    const handleStartSuggestionClick = (result: SearchResult) => {
        isProgrammaticFillRef.current = true;
        setStartLocation(result.description);
        setStartSuggestions([]);
        setShowStartSuggestions(false);
        // Reset flag after a delay
        setTimeout(() => {
            isProgrammaticFillRef.current = false;
        }, 300);
    };

    const handleEndSuggestionClick = (result: SearchResult) => {
        isProgrammaticFillRef.current = true;
        setEndLocation(result.description);
        setEndSuggestions([]);
        setShowEndSuggestions(false);
        // Reset flag after a delay
        setTimeout(() => {
            isProgrammaticFillRef.current = false;
        }, 300);
    };

    const changeMapStyle = (styleUrl: string, name: string) => {
        if (map.current) {
            map.current.setStyle(styleUrl);
            setMapStyle(name);
            setShowStyleMenu(false);
        }
    };

    const handleGetDirections = async () => {
        if (!startLocation || !endLocation) {
            alert('Please enter both start and end locations.');
            return;
        }

        try {
            // Convert addresses to coordinates
            const startCoords = await geocodeAddress(startLocation);
            const endCoords = await geocodeAddress(endLocation);

            if (!startCoords) {
                alert(`Could not find coordinates for start location: ${startLocation}`);
                return;
            }

            if (!endCoords) {
                alert(`Could not find coordinates for end location: ${endLocation}`);
                return;
            }

            // Format coordinates for the Direction API (lat,lng format)
            const origin = `${startCoords.lat},${startCoords.lng}`;
            const destination = `${endCoords.lat},${endCoords.lng}`;

            const apiLink = `${API_URL}/Direction?origin=${origin}&destination=${destination}&vehicle=${DIRECTION_VEHICLE}&api_key=${API_KEY}`;
            const response = await fetch(apiLink);
            const data = await response.json();

            if (data.routes && data.routes.length > 0 && map.current) {
                const route = data.routes[0].overview_polyline.points;
                const distance = data.routes[0].legs[0].distance.text;
                const time = data.routes[0].legs[0].duration.text;
                const decodedRoute = decodePolyline(route);

                // Add markers for start and end points (Mapbox still uses lng,lat)
                addDirectionMarkers([startCoords.lng, startCoords.lat], [endCoords.lng, endCoords.lat]);

                displayRoute(decodedRoute, distance, time);
            } else {
                alert('Could not find a route between the specified locations.');
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            alert('Error fetching directions. Please try again.');
        }
    };

    // Add markers for start and end locations
    const addDirectionMarkers = (startCoords: [number, number], endCoords: [number, number]) => {
        if (!map.current) return;

        // Create custom marker elements
        const startMarkerEl = document.createElement('div');
        startMarkerEl.className = 'direction-marker start-marker';
        startMarkerEl.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #10b981;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const endMarkerEl = document.createElement('div');
        endMarkerEl.className = 'direction-marker end-marker';
        endMarkerEl.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ef4444;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        // Add start marker (green)
        new mapboxgl.Marker({ element: startMarkerEl })
            .setLngLat(startCoords)
            .setPopup(new mapboxgl.Popup().setText('Start Location'))
            .addTo(map.current);

        // Add end marker (red)
        new mapboxgl.Marker({ element: endMarkerEl })
            .setLngLat(endCoords)
            .setPopup(new mapboxgl.Popup().setText('End Location'))
            .addTo(map.current);
    };

    const decodePolyline = (encoded: string) => {
        const points = [];
        let index = 0;
        const len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push([lng * 1e-5, lat * 1e-5]);
        }

        return points;
    };

    const displayRoute = (route: number[][], distance: string, time: string) => {
        if (!map.current) return;

        if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
        }

        map.current.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': route
                }
            }
        });

        map.current.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.9
            }
        });

        // Show route info popup
        const midPoint = route[Math.floor(route.length / 2)];
        new mapboxgl.Popup()
            .setLngLat(midPoint as [number, number])
            .setHTML(`<p><strong>Distance:</strong> ${distance}</p><p><strong>Time:</strong> ${time}</p>`)
            .addTo(map.current);

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.forEach(coord => bounds.extend(coord as [number, number]));
        map.current.fitBounds(bounds, { padding: 50 });
    };

    // Effect for main search autocomplete
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAutoComplete(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Effect for start location autocomplete
    useEffect(() => {
        if (isProgrammaticFillRef.current) {
            return; // Don't fetch autocomplete if programmatically filled
        }

        const timeoutId = setTimeout(() => {
            fetchDirectionAutoComplete(startLocation, 'start');
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [startLocation]);

    // Effect for end location autocomplete
    useEffect(() => {
        if (isProgrammaticFillRef.current) {
            return; // Don't fetch autocomplete if programmatically filled
        }

        const timeoutId = setTimeout(() => {
            fetchDirectionAutoComplete(endLocation, 'end');
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [endLocation]);

    return (
        <div className="relative">
            <div ref={mapContainer} style={{ height }} className="w-full rounded-lg" />

            {/* Search Controls */}
            <div className="absolute top-4 left-4 z-10">
                {!showDirections ? (
                    <div className="flex bg-white rounded-lg shadow-lg">
                        <div className="relative">
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search locations..."
                                className="w-80 rounded-r-none border-r-0"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute top-full w-full bg-white border rounded-b-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                            onClick={() => handleSearchResultClick(result)}
                                        >
                                            {result.description}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="icon" className="rounded-l-none rounded-r-none border-x-0">
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-none"
                            onClick={() => setShowDirections(true)}
                        >
                            <Navigation className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col bg-white rounded-lg shadow-lg p-4 space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Input
                                    value={startLocation}
                                    onChange={(e) => setStartLocation(e.target.value)}
                                    placeholder="Start location (address or lat,lng)"
                                    className="w-60"
                                    onFocus={() => {
                                        if (startSuggestions.length > 0 && !isProgrammaticFillRef.current) {
                                            setShowStartSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                                />
                                {showStartSuggestions && startSuggestions.length > 0 && !isProgrammaticFillRef.current && (
                                    <div className="absolute top-full left-0 right-0 bg-white border rounded-b-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                                        {startSuggestions.map((result, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                                                onClick={() => handleStartSuggestionClick(result)}
                                            >
                                                {result.description}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setShowDirections(false);
                                    setStartLocation('');
                                    setEndLocation('');
                                    setStartSuggestions([]);
                                    setEndSuggestions([]);
                                    setShowStartSuggestions(false);
                                    setShowEndSuggestions(false);
                                    isProgrammaticFillRef.current = false;
                                    if (map.current && map.current.getLayer('route')) {
                                        map.current.removeLayer('route');
                                        map.current.removeSource('route');
                                    }
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Input
                                value={endLocation}
                                onChange={(e) => setEndLocation(e.target.value)}
                                placeholder="End location (address or lat,lng)"
                                className="w-60"
                                onFocus={() => {
                                    if (endSuggestions.length > 0 && !isProgrammaticFillRef.current) {
                                        setShowEndSuggestions(true);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowEndSuggestions(false), 200)}
                            />
                            {showEndSuggestions && endSuggestions.length > 0 && !isProgrammaticFillRef.current && (
                                <div className="absolute top-full left-0 right-0 bg-white border rounded-b-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                                    {endSuggestions.map((result, index) => (
                                        <div
                                            key={index}
                                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                                            onClick={() => handleEndSuggestionClick(result)}
                                        >
                                            {result.description}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button onClick={handleGetDirections} className="w-full">
                            Get Directions
                        </Button>
                    </div>
                )}
            </div>

            {/* Map Style Selector - Positioned to avoid overlap with zoom controls */}
            <div className="absolute bottom-4 right-4 z-10">
                <div className="relative">
                    <Button
                        variant="outline"
                        onClick={() => setShowStyleMenu(!showStyleMenu)}
                        className="bg-white shadow-lg"
                    >
                        {mapStyle}
                    </Button>
                    {showStyleMenu && (
                        <div className="absolute bottom-full right-0 mb-1 bg-white border rounded-lg shadow-lg z-20">
                            {mapStyles.map((style) => (
                                <div
                                    key={style.name}
                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    onClick={() => changeMapStyle(style.url, style.name)}
                                >
                                    {style.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;