import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { useParams } from 'react-router';

const mapContainerStyle = {
    height: '700px',
    width: '100%'
};

const libraries = ['places'];

const EcoTrailMapTrack = () => {
    const [trailPoints, setTrailPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const mapRef = useRef(null);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const fetchTrailPoints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/eco-trail/main-spaces-map-track/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const result = await res.json();
            if (result.status === 'success') {
               
                setTrailPoints(result.data);
            } else {
                console.error('API failed', result);
            }
        } catch (error) {
            console.error('Error fetching points', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrailPoints();
    }, []);

    if (!isLoaded || loading) return <div>Loading map...</div>;

    
    const center = trailPoints.length > 0
        ? { lat: Number(trailPoints[0].lat), lng: Number(trailPoints[0].lng) }
        : { lat: 0, lng: 0 };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}  // Increased zoom level for better visibility
                onLoad={onMapLoad}
                onUnmount={onUnmount}
            >
                {/* Markers with hover title */}
                {trailPoints.map((point, idx) => (
                    <Marker
                        key={idx}
                        position={{ 
                            lat: Number(point.lat), 
                            lng: Number(point.lng) 
                        }}
                        title={point.place}  // This will show on hover
                        label={(idx + 1).toString()}  // shows a number on the marker
                    />
                ))}

                {/* Polyline connecting points */}
                {trailPoints.length > 1 && (
                    <Polyline
                        path={trailPoints.map(point => ({
                            lat: Number(point.lat),
                            lng: Number(point.lng)
                        }))}
                        options={{
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            geodesic: true,  // Follows the curvature of the Earth
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default EcoTrailMapTrack;