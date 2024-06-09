import { getLocations } from "@/data/location";
import { LocationClient } from "./components/Client";

const LocationPage = async () => {
  const locations = await getLocations();
  return (
    <div className="flex-1 space-y-4 pt-2">
      <LocationClient data={locations} />
    </div>
  );
};

export default LocationPage;
