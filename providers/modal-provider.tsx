"use client";

import DepartmentModal from "@/components/modals/department-modal";
import ExamModal from "@/components/modals/exam-modal";
import LocalModal from "@/components/modals/local-modal";
import SessionModal from "@/components/modals/session-modal";
import StudentModal from "@/components/modals/student-modal";
import TeacherModal from "@/components/modals/teacher-modal";
import { useEffect, useState } from "react";
// import UserModal from "@/components/modals/user-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/*
      <UserModal /> */}
      <StudentModal />
      <ExamModal />
      <LocalModal />
      <TeacherModal />
      <DepartmentModal />
      <SessionModal />
    </>
  );
};
