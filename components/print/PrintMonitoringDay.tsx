import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonitoringDay } from "@/data/monitoring";
import React from "react";

interface Props {
  monitoringDay: MonitoringDay[];
}

const PrintMonitoringDay: React.FC<Props> = ({ monitoringDay }) => {
  return (
    <div className="space-y-3">
      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow>
            <TableCell className="border text-center text-xs">Module</TableCell>
            <TableCell className="border text-center text-xs">Local</TableCell>
            <TableCell className="border text-center text-xs" colSpan={4}>
              Surveillance
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitoringDay.map((moduleData) =>
            moduleData.locations.map((location, locationIndex) => (
              <TableRow key={`${moduleData.moduleId}-${locationIndex}`}>
                <TableCell className="border text-xs p-1">
                  <p>Module: {moduleData.moduleTableName}</p>
                  <p>Créneau: {moduleData.timeSlot}</p>
                  <p>
                    Résponsable:
                    {moduleData.responsibleName}
                  </p>
                </TableCell>
                <TableCell className="border text-center text-xs">
                  {location.locationName}
                </TableCell>
                {location.teachers.map((teacher, teacherIndex) => (
                  <TableCell
                    className="border text-center text-xs"
                    key={teacherIndex}
                  >
                    {teacher.firstName} {teacher.lastName}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PrintMonitoringDay;
