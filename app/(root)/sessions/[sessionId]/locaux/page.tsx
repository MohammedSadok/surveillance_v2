import { getLocations } from "@/data/location";
import { LocationClient } from "./components/Client";
interface LocationPageProps {
  params: { departmentId: string; sessionId: string };
}
const LocationPage = async ({ params }: LocationPageProps) => {
  const locations = await getLocations();
  return (
    <div className="flex-1 space-y-4 pt-2">
      <LocationClient data={locations} sessionId={params.sessionId} />
    </div>
  );
};

export default LocationPage;
