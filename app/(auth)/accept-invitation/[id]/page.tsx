import AcceptInvitation from "./accept-invitation";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AcceptInvitation invitationId={(await params).id} />;
}
