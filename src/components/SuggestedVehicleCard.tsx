import { Truck, IndianRupee, Scale3D, Ruler, AlertCircle, Loader2, Info, InfoIcon, BadgeInfoIcon } from "lucide-react";

interface SuggestedVehicleProps {
  vehicle?: {
    vehicle_name: string;
    base_fare_display: string;
    base_fare: string;
    capacity: string;
    size: string;
  } | null;
  loading?: boolean;
}

const SuggestedVehicleCard: React.FC<SuggestedVehicleProps> = ({ vehicle, loading }) => {
  return (
    <div className="p-6 rounded-2xl shadow-md bg-white border border-gray-200 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Suggested Vehicle</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Fetching best option...</span>
        </div>
      ) : !vehicle ? (
        <div className="flex items-center text-red-600 gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>No suitable vehicle found.</span>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent-500" />
            {vehicle.vehicle_name}
          </h2>

          <div className="flex items-center text-gray-700 mb-2">
            <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">Base Fare:</span>
            <span className="ml-1">{vehicle.base_fare_display} (₹{vehicle.base_fare})</span>
          </div>

          <div className="flex items-center text-gray-700 mb-2">
            <Scale3D className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-medium">Capacity:</span>
            <span className="ml-1">{vehicle.capacity}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Ruler className="w-4 h-4 mr-2 text-purple-600" />
            <span className="font-medium">Size:</span>
            <span className="ml-1">{vehicle.size}</span>
          </div>

          <div className="flex items-center gap-2 text-primary-500 mt-2 italic">
          <BadgeInfoIcon className="w-8 h-8 text-red-500" />
          <span>Estimated price — may vary based on real-time conditions</span>
        </div>
        </>
      )}
    </div>
  );
};

export default SuggestedVehicleCard;
