import { notFound } from "next/navigation";
import { InspectionForm } from "@/app/components/hospitality-inspection-form";
import { formTemplates } from "@/app/lib/form-templates";

export default async function InspectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = formTemplates.find((item) => item.slug === slug);
  if (!template) notFound();
  return <InspectionForm template={template} />;
}
