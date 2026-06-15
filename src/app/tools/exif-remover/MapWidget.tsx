'use client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's missing icon issue in Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapWidgetProps {
  lat: number;
  lng: number;
  onPositionChange?: (lat: number, lng: number) => void;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapWidget({ lat, lng, onPositionChange }: MapWidgetProps) {
  const handleDragEnd = (e: any) => {
    const marker = e.target;
    if (marker != null) {
      const position = marker.getLatLng();
      if (onPositionChange) {
        onPositionChange(position.lat, position.lng);
      }
    }
  };

  return (
    <div className="w-full h-56 border-[4px] border-summer-space mt-4 relative z-0 shadow-brutal bg-summer-sky">
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={[lat, lng]} 
          draggable={!!onPositionChange}
          eventHandlers={{ dragend: handleDragEnd }}
        >
          <Popup>
            {onPositionChange ? 'Drag me to adjust GPS coordinates' : 'Detected Image Location'}
          </Popup>
        </Marker>
        {onPositionChange && (
          <MapEvents onMapClick={onPositionChange} />
        )}
      </MapContainer>
      {onPositionChange && (
        <span className="absolute bottom-2 left-2 z-10 bg-summer-space text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest border-[2px] border-summer-space">
          Click map or drag pin to edit coordinates
        </span>
      )}
    </div>
  );
}
