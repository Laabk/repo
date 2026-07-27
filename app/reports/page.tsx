import { ReportsWorkspace } from "@/app/components/reports-workspace";
import { requireSiteAdmin } from "@/app/chatgpt-auth";

export default async function ReportsPage() {
  await requireSiteAdmin("/reports");
  return <ReportsWorkspace />;
}
