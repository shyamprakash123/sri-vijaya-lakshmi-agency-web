import React, { useEffect, useRef } from 'react';
import { MapPin, Store } from 'lucide-react';
import { OlaMaps } from 'olamaps-web-sdk';
import ReactDOMServer from 'react-dom/server';
import { div } from 'framer-motion/client';

interface LocationMarkerProps {
  coordinates: { lat: number; lng: number };
}

declare global {
  interface Window {
    OlaMaps: any;
  }
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ coordinates }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const initMap = async () => {
    const olaMaps = new OlaMaps({
      apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY || 'demo-key',
    });

    const map = olaMaps.init({
      container: mapRef.current,
      style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      center: [coordinates.lng, coordinates.lat],
      zoom: 15,
    });

    const iconHtml = ReactDOMServer.renderToString(
      <MapPin className="h-14 w-14 text-secondary-500 drop-shadow-md fill-primary-800" />
    );

    const el = document.createElement('div');
    el.innerHTML = iconHtml;
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';

    markerRef.current = olaMaps
      .addMarker({
        element: el,
        anchor: 'bottom',
        draggable: false,
      })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);

    mapInstance.current = map;
  };

  const moveToLocation = () => {
    mapInstance.current?.flyTo({ center: [coordinates.lng, coordinates.lat], zoom: 15 });
  }

  useEffect(() => {
    initMap();
  }, [coordinates]);

  return (
    <div className="relative">
      {/* Map Element */}
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden" />

      {/* Move to Location Button */}
      <button
        onClick={moveToLocation}
        className="absolute top-4 right-4 z-10 bg-white border border-gray-300 text-sm px-4 py-2 rounded shadow hover:bg-gray-100"
      >
        Drop location
      </button>
    </div>

  );
};

export default LocationMarker;
