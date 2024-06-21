"use client";

import { Loader } from "@/components/ui/loader";

const Loading = () => {
  return (
    <div className="flex flex-1 items-center justify-center h-96">
      <Loader />
    </div>
  );
};

export default Loading;
