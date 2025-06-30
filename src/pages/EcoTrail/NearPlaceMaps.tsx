import { useRef, useCallback } from 'react';
import React from 'react'
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
    height: '400px',
    width: '100%'
};

// Always include 'places' if you use Autocomplete or plan to use it
const libraries = ['places'];

const NearPlaceMaps = ({ lat, lng }) => {
    // console.log("NearPlaceMaps", lat, lng);
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const mapRef = useRef(null);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    // Set center to lat/lng if available, else fallback to default
    const center = (lat && lng)
        ? { lat: Number(lat), lng: Number(lng) }
        : { lat: 0, lng: 0 };

    return (
        <div>
            <div className="mt-4" style={{ height: '400px' }}>
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={15}
                        onLoad={onMapLoad}
                        onUnmount={onUnmount}
                    >
                        {lat && lng && (
                            <Marker
                                position={{ lat: Number(lat), lng: Number(lng) }}
                            />
                        )}
                    </GoogleMap>
                )}
                {loadError && <div>Error loading maps</div>}
            </div>
        </div>
    )
}

export default NearPlaceMaps