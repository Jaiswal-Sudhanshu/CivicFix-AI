import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { reverseGeocodeCoords } from '../evidenceEngine';

// Custom SVG Pin Icon for CivicFix
const createCivicPinIcon = (color = '#2E3D28') => {
  return L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        background: ${color};
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

const nearbyIncidentIcon = L.divIcon({
  className: 'nearby-incident-pin',
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #dc2626;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function InteractiveMap({
  initialLat = 26.8467,
  initialLon = 80.9462,
  initialAddress = "Hazratganj, Lucknow, Uttar Pradesh",
  onLocationChange,
  nearbyComplaints = [],
  readOnly = false,
  showCaptureGps = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const captureMarkerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);
  const [address, setAddress] = useState(initialAddress);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locationSource, setLocationSource] = useState('manual_pin'); // 'device_gps' | 'manual_pin'
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // { type: 'success' | 'warning' | 'error', message: string }
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: !readOnly
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | CivicFix AI'
      }).addTo(map);

      // Main pin marker
      const marker = L.marker([currentLat, currentLon], {
        icon: createCivicPinIcon('#2E3D28'),
        draggable: !readOnly
      }).addTo(map);

      marker.bindPopup(`<b>Reported Defect Location</b><br/>${address}`).openPopup();

      if (!readOnly) {
        // Handle Drag End
        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          handlePositionUpdate(pos.lat, pos.lng, 'manual_pin');
        });

        // Handle Map Click
        map.on('click', async (e) => {
          marker.setLatLng(e.latlng);
          handlePositionUpdate(e.latlng.lat, e.latlng.lng, 'manual_pin');
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external coordinates changes (e.g. from preset select)
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      if (Math.abs(currentLat - initialLat) > 0.0001 || Math.abs(currentLon - initialLon) > 0.0001) {
        setCurrentLat(initialLat);
        setCurrentLon(initialLon);
        setAddress(initialAddress);
        markerRef.current.setLatLng([initialLat, initialLon]);
        mapInstanceRef.current.setView([initialLat, initialLon], 15);
      }
    }
  }, [initialLat, initialLon, initialAddress]);

  // Display Nearby Complaints on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing nearby layers if any
    const layerGroup = L.layerGroup().addTo(map);
    if (Array.isArray(nearbyComplaints)) {
      nearbyComplaints.forEach(item => {
        if (item.latitude && item.longitude) {
          const m = L.marker([item.latitude, item.longitude], { icon: nearbyIncidentIcon });
          m.bindPopup(`
            <div style="font-size: 0.8rem;">
              <strong style="color: #dc2626;">Nearby Report (${item.distance_meters || '100'}m)</strong><br/>
              <b>${item.category}</b>: ${item.description ? item.description.substring(0, 60) + '...' : ''}<br/>
              <span style="font-size: 0.72rem; color: #666;">Status: ${item.status || 'Active'}</span>
            </div>
          `);
          layerGroup.addLayer(m);
        }
      });
    }

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [nearbyComplaints]);

  // Display capture-time GPS marker if available for comparison
  useEffect(() => {
    if (!mapInstanceRef.current || !showCaptureGps) return;
    const map = mapInstanceRef.current;

    if (showCaptureGps.latitude && showCaptureGps.longitude) {
      if (captureMarkerRef.current) {
        map.removeLayer(captureMarkerRef.current);
      }

      const capMarker = L.marker([showCaptureGps.latitude, showCaptureGps.longitude], {
        icon: createCivicPinIcon('#16a34a')
      }).addTo(map);

      capMarker.bindPopup(`<b>Verified Camera Capture GPS</b><br/>Lat: ${showCaptureGps.latitude.toFixed(5)}<br/>Lon: ${showCaptureGps.longitude.toFixed(5)}`);
      captureMarkerRef.current = capMarker;
    }
  }, [showCaptureGps]);

  // Updates position, reverse geocodes, and calls parent callback
  const handlePositionUpdate = async (lat, lon, source = 'manual_pin', accuracy = null) => {
    setCurrentLat(lat);
    setCurrentLon(lon);
    setLocationSource(source);
    if (accuracy) setGpsAccuracy(accuracy);

    setIsReverseGeocoding(true);
    const newAddress = await reverseGeocodeCoords(lat, lon);
    setIsReverseGeocoding(false);
    setAddress(newAddress);

    if (markerRef.current) {
      markerRef.current.setPopupContent(`<b>Location:</b><br/>${newAddress}`);
    }

    if (onLocationChange) {
      onLocationChange({
        latitude: lat,
        longitude: lon,
        address: newAddress,
        accuracy_meters: accuracy,
        source: source
      });
    }
  };

  // Live Browser GPS: Use My Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Browser Geolocation is not supported on this device. Please select location manually on the map.'
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy * 10) / 10;

        setLocationStatus({
          type: 'success',
          message: `Live GPS locked with ±${acc}m accuracy.`
        });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 17);
          markerRef.current.setLatLng([lat, lon]);
        }

        await handlePositionUpdate(lat, lon, 'device_gps', acc);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not acquire device GPS.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can still pinpoint the location by tapping anywhere on the map.';
        } else if (err.code === 2) {
          msg = 'GPS signal unavailable. Please use the map pin or manual address.';
        } else if (err.code === 3) {
          msg = 'GPS request timed out. Please tap your location on the map.';
        }
        setLocationStatus({
          type: 'warning',
          message: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
      {/* Map Control Toolbar */}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface-raised)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: 'var(--deep-olive)' }} />
            <strong style={{ fontSize: '0.84rem', color: 'var(--deep-olive)' }}>
              Interactive Incident Geotagging
            </strong>
          </div>

          <button
            type="button"
            className="btn-olive"
            style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Navigation size={13} />
            )}
            <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
          </button>
        </div>
      )}

      {/* Status Notice Banner */}
      {locationStatus && (
        <div style={{ 
          padding: '8px 14px', 
          fontSize: '0.78rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: locationStatus.type === 'success' ? 'var(--sage-green-light)' : locationStatus.type === 'warning' ? '#fef3c7' : '#fee2e2',
          color: locationStatus.type === 'success' ? 'var(--deep-olive)' : locationStatus.type === 'warning' ? '#92400e' : '#991b1b',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {locationStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{locationStatus.message}</span>
        </div>
      )}

      {/* Leaflet Map DOM Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: readOnly ? '240px' : '320px', zIndex: 1 }} 
      />

      {/* Location Details Footer Bar */}
      <div style={{ padding: '10px 14px', background: '#ffffff', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep-olive)' }}>
            {isReverseGeocoding ? 'Resolving street address...' : address}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>Lat: {currentLat.toFixed(5)}°N</span>
            <span>Lon: {currentLon.toFixed(5)}°E</span>
            {gpsAccuracy && (
              <span style={{ color: 'var(--status-resolved)', fontWeight: 600 }}>
                (GPS Accuracy: ±{gpsAccuracy}m)
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.72rem', 
            padding: '3px 8px', 
            borderRadius: 'var(--radius-pill)', 
            background: locationSource === 'device_gps' ? 'var(--status-resolved-bg)' : 'var(--bg-surface-raised)',
            color: locationSource === 'device_gps' ? 'var(--status-resolved)' : 'var(--text-secondary)',
            fontWeight: 700
          }}>
            {locationSource === 'device_gps' ? 'Live Hardware GPS' : 'Citizen Manual Pin'}
          </span>
        </div>
      </div>
    </div>
  );
}
