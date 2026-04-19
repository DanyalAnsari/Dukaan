"use client";

import { Path, useForm } from "react-hook-form";
import { SetupFormValues } from "../_lib/schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SetupInputField({
  name,
  label,
  placeholder,
  description,
  className,
  disabled,
  register,
  error,
}: {
  name: Path<SetupFormValues>;
  label: string;
  placeholder: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  register: ReturnType<typeof useForm<SetupFormValues>>["register"];
  error?: { message?: string };
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          "h-12 bg-muted/30 transition-all focus:bg-background",
          className
        )}
        {...register(name)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}
