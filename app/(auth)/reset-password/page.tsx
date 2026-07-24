"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return toast.error("This reset link is invalid or expired.");
    setPending(true);
    const { error } = await authClient.resetPassword({ token, newPassword: password });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    router.push("/login");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Use at least eight characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="reset-password" onSubmit={submit}>
          <FieldGroup>
            <Field data-invalid={!token}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input id="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={!token} disabled={!token} value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button form="reset-password" className="w-full" disabled={pending || !token}>
          {pending && <Spinner data-icon="inline-start" />}
          Update password
        </Button>
      </CardFooter>
    </Card>
  );
}
