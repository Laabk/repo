import { ReportDocument } from "@/app/components/report-document";
import { requireSiteAdmin } from "@/app/chatgpt-auth";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSiteAdmin(`/reports/${id}`);
  return <ReportDocument id={id} />;
}
