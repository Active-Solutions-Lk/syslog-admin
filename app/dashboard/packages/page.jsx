import { PackageManagement } from "@/components/dashboard/package-management";

export default function PackagesPage() {
  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
      <PackageManagement />
    </div>
  );
}