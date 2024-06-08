import { getDays } from "@/lib/query";

const page = async () => {
  const result = await getDays(5);
  console.log(result[0]);
  return <div>page</div>;
};

export default page;
