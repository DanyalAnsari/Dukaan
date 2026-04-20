"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Store,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence } from "motion/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressIndicator } from "./_components/progressbar-indicator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { setupShopAction } from "./_lib/actions";
import { STEPS } from "@/constants";
import { setupFormSchema, type SetupFormInput, type SetupFormOutput } from "./_lib/schema";
import { MotionDiv } from "@/components/shared/motion/div";
import SetupInputField from "./_components/setup-input-fields";

const STEP_ICONS = [Store, ShieldCheck, CreditCard] as const;

type InputConfig = {
  name: Exclude<keyof SetupFormInput, "address">;
  label: string;
  placeholder: string;
  className?: string;
  description?: string;
  step: number;
};

const INPUTS: InputConfig[] = [
  {
    name: "name",
    label: "Shop Name *",
    placeholder: "Sharma General Store",
    className: "text-lg",
    step: 0,
  },
  {
    name: "phone",
    label: "Business Phone",
    placeholder: "98765 43210",
    className: "font-mono",
    step: 0,
  },
  {
    name: "pan",
    label: "PAN Number (Optional)",
    placeholder: "ABCDE1234F",
    className: "font-mono uppercase",
    step: 1,
  },
  {
    name: "gstin",
    label: "GSTIN (Optional)",
    placeholder: "22AAAAA0000A1Z5",
    className: "font-mono uppercase",
    step: 1,
  },
  {
    name: "upiId",
    label: "UPI ID for Payments",
    placeholder: "shopname@okicici",
    className: "font-mono",
    description: "Used to generate dynamic QR codes on invoices.",
    step: 2,
  },
  {
    name: "invoicePrefix",
    label: "Invoice Prefix",
    placeholder: "INV-",
    className: "font-mono",
    step: 2,
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentStep = STEPS[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;
  const StepIcon = STEP_ICONS[activeStep];

  const form = useForm<SetupFormInput, any, SetupFormOutput>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      pan: "",
      gstin: "",
      upiId: "",
      invoicePrefix: "INV-",
      address: "",
    },
    mode: "onTouched",
    shouldFocusError: true,
  });

  const {
    register,
    control,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const isBusy = isSaving || isSubmitting;
  const invoicePrefix = useWatch({
    control,
    name: "invoicePrefix",
  });

  const currentInputs = INPUTS.filter((input) => input.step === activeStep);

  const handleNext = async () => {
    const isValid = await trigger(currentStep.fields, {
      shouldFocus: true,
    });

    if (!isValid) return;

    // Helps avoid accidental keyboard-triggered submit
    (document.activeElement as HTMLElement | null)?.blur();

    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const submitForm = handleSubmit(async (data) => {
    setIsSaving(true);
    const toastId = toast.loading("Setting up your shop...");

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        formData.append(key, String(value ?? ""));
      }

      const result = await setupShopAction(formData);

      if (result?.success) {
        toast.success("Shop created! Welcome to Dukaan.", { id: toastId });
        router.push("/dashboard");
        return;
      }

      if (result?.errors?.length) {
        toast.error("Error creating shop", {
          id: toastId,
          description: result.errors.map((e) => e.message).join(", "),
        });
        return;
      }

      toast.error("Failed to create shop", { id: toastId });
    } catch (error) {
      console.error("Error creating shop:", error);
      toast.error("Failed to create shop", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  });

  const handleFormKeyDown = async (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;

    // Allow Enter in textarea
    if (target.tagName === "TEXTAREA") return;

    // Prevent browser implicit submit
    e.preventDefault();

    if (isBusy) return;

    if (isLastStep) {
      await submitForm();
    } else {
      await handleNext();
    }
  };

  return (
    <Card className="relative w-full max-w-lg space-y-4 overflow-hidden border-none bg-background/60 p-4 shadow-2xl ring-1 ring-border/50 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />

      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <StepIcon className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {activeStep === 0
              ? "Welcome to Dukaan"
              : activeStep === 1
                ? "Business Identity"
                : "Billing Details"}
          </CardTitle>

          <CardDescription className="text-muted-foreground">
            {currentStep.label} — Step {activeStep + 1} of {STEPS.length}
          </CardDescription>
        </div>

        <ProgressIndicator current={activeStep} />
      </CardHeader>

      <CardContent>
        <form
          id="setup-form"
          onSubmit={submitForm}
          onKeyDown={handleFormKeyDown}
        >
          <AnimatePresence mode="wait">
            <MotionDiv
              key={activeStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <FieldGroup className="space-y-5">
                {currentInputs.map((input) => (
                  <SetupInputField
                    key={input.name}
                    name={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    className={input.className}
                    disabled={isBusy}
                    register={register}
                    description={
                      input.name === "invoicePrefix"
                        ? `Next invoice: {${invoicePrefix || "INV-"}}0001`
                        : input.description
                    }
                    error={
                      errors[input.name as keyof SetupFormValues] as
                        | { message?: string }
                        | undefined
                    }
                  />
                ))}

                {activeStep === 2 && (
                  <Field data-invalid={!!errors.address}>
                    <FieldLabel htmlFor="address">Shop Address</FieldLabel>
                    <Textarea
                      id="address"
                      placeholder="123, Main Street, Mumbai - 400001"
                      rows={3}
                      disabled={isBusy}
                      className="bg-muted/30 transition-all focus:bg-background"
                      {...register("address")}
                    />
                    {errors.address && <FieldError errors={[errors.address]} />}
                  </Field>
                )}
              </FieldGroup>
            </MotionDiv>
          </AnimatePresence>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          {activeStep > 0 && (
            <Button
              key={`back-to-step${activeStep - 1}`}
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isBusy}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {!isLastStep ? (
            <Button
              type="button"
              key={`continue-to-step${activeStep + 1}`}
              onClick={handleNext}
              disabled={isBusy}
              className="flex-1 shadow-lg shadow-primary/20"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              key="submit"
              form="setup-form"
              disabled={isBusy}
              className="flex-1 shadow-lg shadow-primary/20"
            >
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : (
                "Start Billing"
              )}
            </Button>
          )}
        </Field>
      </CardFooter>
    </Card>
  );
}
