import React from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { AddTaskModal } from "@/components/AddTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutShell>
      {children}
      <AddTaskModal />
      <EditTaskModal />
    </LayoutShell>
  );
}
