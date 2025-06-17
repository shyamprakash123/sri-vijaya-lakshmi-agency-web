import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation, X, Store } from 'lucide-react';
import { Address } from '../../types';
import { OlaMaps } from 'olamaps-web-sdk';
import ReactDOMServer from 'react-dom/server';

interface LocationPickerProps {
  onLocationSelect: (address: Address) => void;
  initialAddress?: Address;
}

declare global {
  interface Window {
    OlaMaps: any;
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialAddress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string | number | undefined>("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const extractPincode = (address: string): string => {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : '';
  };

  const reverseGeoCode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${import.meta.env.VITE_OLA_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.results[0];
        if (address) {
          const locationData: Address = {
            fullName: userName,
            phoneNumber: phoneNumber,
            fullAddress: address.formatted_address,
            pincode: extractPincode(address.formatted_address),
            landmark: '',
            coordinates: { lat, lng },
          };
          setSelectedLocation(locationData);
          onLocationSelect(locationData);
        }
      }
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateMarker = (lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (mapInstance.current && window.OlaMaps) {
      markerRef.current = new window.OlaMaps.Marker()
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
  };

  const initMap = async () => {
    const olaMaps = new OlaMaps({
      apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY || 'demo-key',
    });

    const map = olaMaps.init({
      container: mapRef.current,
      style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      center: [78.36299833770227, 17.47471239945692],
      zoom: 14,
    });

    const iconHtml = ReactDOMServer.renderToString(
      <Store size={36} className="text-orange-600" />
    );

    const el = document.createElement('div');
    el.innerHTML = iconHtml;
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';

    const marker = olaMaps
      .addMarker({
        element: el,
        anchor: 'bottom',
        draggable: false,
      })
      .setLngLat([
        parseFloat(import.meta.env.VITE_STORE_LNG),
        parseFloat(import.meta.env.VITE_STORE_LAT),
      ])
      .addTo(map);

    // Optional: Add info popup
    const popup = olaMaps.addPopup({ offset: 25 }).setHTML(`
      <div class="text-sm">
        <strong>Sri Vijaya Lakshmi Agency</strong><br />
      </div>
    `);

    marker.setPopup(popup).togglePopup();;

    await reverseGeoCode(17.47471239945692, 78.36299833770227);

    mapInstance.current = map;

    const geolocate = olaMaps.addGeolocateControls({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    });

    map.addControl(geolocate);

    map.on('load', () => {
      geolocate.trigger();
    });

    map.on('moveend', async () => {
      const center = map.getCenter();
      const { lat, lng } = center;

      await reverseGeoCode(lat, lng);
    });
  };

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    const locationData: Address = {
      fullName: userName,
      phoneNumber: phoneNumber,
    };
    onLocationSelect(locationData);
  }, [userName, phoneNumber]);

  const searchLocations = async (query: string) => {
    if (!query.trim()) return setSuggestions([]);
    try {
      setLoading(true);
      const locationParam = userLocation
        ? `location=${userLocation.lat},${userLocation.lng}&`
        : '';
      const response = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?${locationParam}input=${encodeURIComponent(query)}&api_key=${import.meta.env.VITE_OLA_MAPS_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = async (suggestion: any) => {
    try {
      setLoading(true);
      const coords = suggestion?.geometry?.location || { lat: 17.439204293719442, lng: 78.35811839999997 };
      const locationData: Address = {
        fullName: userName,
        phoneNumber: phoneNumber,
        fullAddress: suggestion.description,
        pincode: extractPincode(suggestion.description),
        landmark: '',
        coordinates: coords, // Placeholder
      };
      setSelectedLocation(locationData);
      setSearchQuery(suggestion.description);
      setSuggestions([]);
      mapInstance.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 15 });
      onLocationSelect(locationData);
    } catch (error) {
      console.error('Select suggestion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      try {
        const response = await fetch(
          `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${import.meta.env.VITE_OLA_MAPS_API_KEY}`
        );
        let address = 'Current Location';
        if (response.ok) {
          const data = await response.json();
          address = data.results[0]?.formatted_address || 'Current Location';
        }
        const locationData = {
          fullAddress: address,
          pincode: extractPincode(address),
          landmark: '',
          coordinates: { lat: latitude, lng: longitude },
        };
        setSelectedLocation(locationData);
        setSearchQuery(address);
        updateMarker(latitude, longitude);
        onLocationSelect(locationData);
      } catch (error) {
        console.error('Current location reverse geocoding failed:', error);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Geolocation error:', err);
      setLoading(false);
    });
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Left Panel: Form Inputs */}
      <div className="w-full md:w-[400px] space-y-6 bg-white p-6 rounded-lg shadow-md z-30">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Selected Address */}
        {selectedLocation && (
          <div className="bg-white rounded shadow-md p-4 text-sm z-20">
            <div className="font-semibold">Delivery Address</div>
            <div>{selectedLocation.fullAddress}</div>
            <div className="text-xs text-gray-500">Pincode: {selectedLocation.pincode}</div>
          </div>
        )}
      </div>

      {/* Right Panel: Map */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">

        {/* Map Element */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Fixed Center Marker */}
        <div className="absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-full pointer-events-none">
          <MapPin className="h-14 w-14 text-secondary-500 drop-shadow-md fill-primary-800" />
        </div>

        {/* Search Bar */}
        <div className="absolute top-12 md:top-4 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-md w-[90%] max-w-md flex items-center p-2 z-20">
          <Search className="mr-2 text-gray-500" />
          <input
            className="w-full outline-none"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchLocations(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search a place..."
          />
          {searchQuery && (
            <X
              className="ml-2 cursor-pointer text-gray-500"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
            />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && isFocused && (
          <div className="absolute top-24 md:top-16 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded w-[90%] max-w-md z-30 max-h-[200px] overflow-auto">
            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="p-2 border-b cursor-pointer hover:bg-gray-100"
                onClick={() => selectSuggestion(sugg)}
              >
                {sugg.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

};

export default LocationPicker;
