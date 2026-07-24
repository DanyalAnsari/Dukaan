"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function AcceptInvitation({ invitationId }: { invitationId: string }) {
  const { data: session, isPending: sessionPending } = useSession();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function accept() {
    setPending(true);
    const { error } = await authClient.organization.acceptInvitation({ invitationId });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Invitation accepted.");
    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join this shop</CardTitle>
        <CardDescription>Accept the invitation to start working with the team.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {session ? `Signed in as ${session.user.email}` : "Sign in with the invited email address first."}
        </p>
      </CardContent>
      <CardFooter>
        {sessionPending ? <Spinner /> : session ? (
          <Button className="w-full" disabled={pending} onClick={accept}>
            {pending && <Spinner data-icon="inline-start" />}
            Accept invitation
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`}>Sign in to accept</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
