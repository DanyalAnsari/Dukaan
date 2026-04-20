import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignupForm from "../_components/signup-form";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  return (
    <div className="space-y-6 fade-in">
      <Card className="border-none bg-transparent shadow-none">
        {/* Header */}
        <CardHeader className="space-y-1 px-0 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Register your shop account
          </CardDescription>
        </CardHeader>

        {/* Form */}
        <CardContent className="px-0">
          <SignupForm />
        </CardContent>

        {/* Footer link */}
        <CardFooter className="flex-col gap-6 px-0 py-4">
          <Separator />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
