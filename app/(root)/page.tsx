import { createOccupiedTeacherInPeriod } from "@/data/teacher";

const page = async () => {
  await createOccupiedTeacherInPeriod({
    teacherId: 1,
    cause: "TT",
    timeSlotId: 129,
  });
  return <div>page</div>;
};

export default page;
