import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "../_components/login-form";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Login | Dukaan",
  description: "Login to your shop account",
};

export default function LoginPage() {
  return (
    <div className="fade-in">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="space-y-1 px-0 text-center">
          <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your shop account
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent className="px-0">
          <LoginForm />
        </CardContent>

        {/* Footer link */}
        <CardFooter className="flex-col gap-6 px-0">
          <Separator />
          <p className="text-center text-sm text-muted-foreground">
            New to Dukaan?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
