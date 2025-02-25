import { ProfileSettings } from "@/components/ProfileSettings";

export function Settings() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <ProfileSettings />
    </div>
  );
}