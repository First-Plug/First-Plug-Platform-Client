import { TruckIcon } from "lucide-react";

export const EmptyLogistics = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-center">
      <div className="flex justify-center items-center bg-gray-100 mb-4 rounded-full w-16 h-16">
        <TruckIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900 text-lg">
        No logistics orders
      </h3>
      <p className="max-w-md text-gray-500">
        No logistics orders found. Data will appear here when new orders are
        added.
      </p>
    </div>
  );
};
