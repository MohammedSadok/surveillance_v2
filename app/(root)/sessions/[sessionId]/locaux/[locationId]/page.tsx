import LocationSchedule from "@/components/LocationSchedule";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getLocationById, getLocationCalendar } from "@/data/location";

type Props = {
  params: { locationId: string; sessionId: string };
};

const page = async ({ params }: Props) => {
  const local = await getLocationById(parseInt(params.locationId));
  const occupationCalendar = await getLocationCalendar(
    parseInt(params.sessionId),
    parseInt(params.locationId)
  );
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Local  ${local?.name}`}
          description="Gérer les heurs d'occupation"
        />
      </div>
      <Separator />
      <LocationSchedule
        sessionDays={occupationCalendar}
        locationId={parseInt(params.locationId)}
      />
    </>
  );
};

export default page;
