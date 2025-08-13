import { useRef, useCallback, useState, useEffect } from 'react';
import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const libraries = ['places'];

const NearPlaceMaps = ({
  lat,
  lng,
  onMainMarkerDrag,
  onMapClickAddPoint,
  latlongInfo = []
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState(
    lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  );

  useEffect(() => {
    if (lat && lng) {
      setMarkerPosition({ lat: Number(lat), lng: Number(lng) });
    }
  }, [lat, lng]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarkerPosition({ lat: newLat, lng: newLng });
    if (onMainMarkerDrag) {
      onMainMarkerDrag({ lat: newLat, lng: newLng });
    }
  };

  const handleMapClick = (e) => {
    const clickedLat = e.latLng.lat();
    const clickedLng = e.latLng.lng();
    if (onMapClickAddPoint) {
      onMapClickAddPoint({ lat: clickedLat, lng: clickedLng });
    }
  };

  const center = markerPosition || { lat: 0, lng: 0 };

  return (
    <div className="mt-4" style={{ height: '400px' }}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onLoad={onMapLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {/* Main draggable marker */}
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}

          {/* Dynamic latlong_info markers */}
          {/* {latlongInfo.map((point, index) => (
            <Marker
              key={index}
              position={{
                lat: Number(point.lat),
                lng: Number(point.lng),
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />
          ))} */}

          {latlongInfo.map((point, index) => (
            <Marker
              key={index}
              position={{
                lat: Number(point.lat),
                lng: Number(point.lng),
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              label={point.name ? point.name.charAt(0) : String(index + 1)}
              title={point.name || `Point ${index + 1}`}
            />
          ))}
        </GoogleMap>
      )}
      {loadError && <div>Error loading maps</div>}
    </div>
  );
};

export default NearPlaceMaps;
