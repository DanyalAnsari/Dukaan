"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function BackLink({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  return (
    <Button onClick={() => router.back()} variant="link">
      <ArrowLeft className="h-5 w-5" />
      {children}
    </Button>
  );
}
