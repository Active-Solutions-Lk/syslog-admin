import { ProjectManagement } from "@/components/dashboard/project-management";

export default function ProjectsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
      <ProjectManagement />
    </div>
  );
}