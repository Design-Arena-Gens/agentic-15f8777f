import Dashboard from "@/components/dashboard";
import { listAIProfiles, listAccounts, listUploadTasks } from "@/lib/db";

export default function HomePage() {
  const uploads = listUploadTasks();
  const accounts = listAccounts();
  const profiles = listAIProfiles();

  return <Dashboard initialAccounts={accounts} initialProfiles={profiles} initialUploads={uploads} />;
}
