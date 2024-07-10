"use client";
import {
  addTeacherMonitoringOut,
  getTeacherMonitoringOut,
  removeTeacherMonitoringOut,
} from "@/data/teacher";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

type Props = {
  teacherId: number;
};

const MonitoringOut = ({ teacherId }: Props) => {
  const [monitoringCount, setMonitoringCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      const result = await getTeacherMonitoringOut(teacherId);
      setMonitoringCount(result);
    };
    fetchData();
  }, [teacherId]);
  const handleAddMonitoringOut = async () => {
    try {
      setLoading(true);
      await addTeacherMonitoringOut(teacherId);
      setMonitoringCount((prev) => prev + 1);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };
  const handleRemoveMonitoringOut = async () => {
    try {
      if (monitoringCount === 0)
        return toast.error("No monitoring out to remove.");
      setLoading(true);
      await removeTeacherMonitoringOut(teacherId);
      setMonitoringCount((prev) => prev - 1);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={handleRemoveMonitoringOut}
        disabled={loading}
        className="p-2 rounded-xl"
      >
        <Minus />
      </Button>
      <span className="text-5xl font-bold">{monitoringCount}</span>
      <Button
        onClick={handleAddMonitoringOut}
        disabled={loading}
        className="p-2 rounded-xl"
      >
        <Plus />
      </Button>
    </div>
  );
};

export default MonitoringOut;
