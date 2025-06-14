import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { Address } from '../../types';

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
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [manualAddress, setManualAddress] = useState<Address>(
    initialAddress || { fullAddress: '', pincode: '', landmark: '' }
  );
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Load Ola Maps SDK
    const script = document.createElement('script');
    script.src = 'https://api.olamaps.io/places/v1/autocomplete';
    script.async = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (mapRef.current && window.OlaMaps) {
      mapInstance.current = new window.OlaMaps.Map({
        container: mapRef.current,
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
        center: [77.5946, 12.9716], // Bangalore coordinates
        zoom: 12,
        accessToken: process.env.VITE_OLA_MAPS_API_KEY || 'demo-key'
      });

      mapInstance.current.on('click', handleMapClick);
    }
  };

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;
    
    try {
      setLoading(true);
      
      // Reverse geocoding to get address from coordinates
      const response = await fetch(
        `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${process.env.VITE_OLA_MAPS_API_KEY || 'demo-key'}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.results[0];
        
        if (address) {
          const locationData = {
            fullAddress: address.formatted_address,
            pincode: extractPincode(address.formatted_address),
            landmark: '',
            coordinates: { lat, lng }
          };
          
          setSelectedLocation(locationData);
          updateMarker(lat, lng);
          onLocationSelect(locationData);
        }
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarker = (lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    if (mapInstance.current && window.OlaMaps) {
      markerRef.current = new window.OlaMaps.Marker()
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);
        
      mapInstance.current.flyTo({
        center: [lng, lat],
        zoom: 15
      });
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call - replace with actual Ola Maps Places API
      const response = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${process.env.VITE_OLA_MAPS_API_KEY || 'demo-key'}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.predictions || []);
      } else {
        // Fallback to mock data if API fails
        setSuggestions([
          {
            place_id: '1',
            description: `${query} - Bangalore, Karnataka`,
            structured_formatting: {
              main_text: query,
              secondary_text: 'Bangalore, Karnataka'
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      // Fallback suggestions
      setSuggestions([
        {
          place_id: '1',
          description: `${query} - Bangalore, Karnataka`,
          structured_formatting: {
            main_text: query,
            secondary_text: 'Bangalore, Karnataka'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = async (suggestion: any) => {
    try {
      setLoading(true);
      
      // Get place details - mock implementation
      const locationData = {
        fullAddress: suggestion.description,
        pincode: extractPincode(suggestion.description),
        landmark: '',
        coordinates: { lat: 12.9716, lng: 77.5946 } // Default to Bangalore
      };
      
      setSelectedLocation(locationData);
      setSearchQuery(suggestion.description);
      setSuggestions([]);
      updateMarker(locationData.coordinates.lat, locationData.coordinates.lng);
      onLocationSelect(locationData);
    } catch (error) {
      console.error('Error selecting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding for current location
            const response = await fetch(
              `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${process.env.VITE_OLA_MAPS_API_KEY || 'demo-key'}`
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
              coordinates: { lat: latitude, lng: longitude }
            };
            
            setSelectedLocation(locationData);
            setSearchQuery(address);
            updateMarker(latitude, longitude);
            onLocationSelect(locationData);
          } catch (error) {
            console.error('Error getting current location details:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setLoading(false);
        }
      );
    }
  };

  const extractPincode = (address: string): string => {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : '';
  };

  const handleManualAddressChange = (field: keyof Address, value: string) => {
    const updatedAddress = { ...manualAddress, [field]: value };
    setManualAddress(updatedAddress);
    onLocationSelect(updatedAddress);
  };

  if (useManualEntry) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Enter Address Manually</h3>
          <button
            onClick={() => setUseManualEntry(false)}
            className="text-purple-500 hover:text-purple-600 font-medium"
          >
            Use Map Instead
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address *
            </label>
            <textarea
              value={manualAddress.fullAddress}
              onChange={(e) => handleManualAddressChange('fullAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Enter complete delivery address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                value={manualAddress.pincode}
                onChange={(e) => handleManualAddressChange('pincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter pincode"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={manualAddress.landmark}
                onChange={(e) => handleManualAddressChange('landmark', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter landmark"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin size={20} className="mr-2 text-purple-500" />
          Select Delivery Location
        </h3>
        <button
          onClick={() => setUseManualEntry(true)}
          className="text-purple-500 hover:text-purple-600 font-medium text-sm"
        >
          Enter Manually
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchLocations(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Navigation size={18} />
            )}
            <span className="hidden sm:inline">Current</span>
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id || index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                <div className="text-sm text-gray-600">
                  {suggestion.structured_formatting?.secondary_text || ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"
        >
          {!window.OlaMaps && (
            <div className="text-center">
              <MapPin size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Selected Location</h4>
          <p className="text-purple-700">{selectedLocation.fullAddress}</p>
          {selectedLocation.pincode && (
            <p className="text-sm text-purple-600">Pincode: {selectedLocation.pincode}</p>
          )}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        Click on the map to select a location or search for an address above
      </p>
    </div>
  );
};

export default LocationPicker;