import { SigningRoom } from "@/app/components/signing-room";

export default async function SigningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SigningRoom token={token} />;
}
