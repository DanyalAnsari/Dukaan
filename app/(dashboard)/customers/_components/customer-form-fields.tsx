"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import type { CustomerInput } from "../_lib/schema";

interface CustomerFormFieldsProps {
  form: UseFormReturn<CustomerInput>;
}

/**
 * Shared field group used by both CreateCustomerDialog and EditCustomerDialog.
 * Keeping form fields in one place ensures both dialogs stay in sync.
 */
export function CustomerFormFields({ form }: CustomerFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g. Rahul Sharma"
        />
        {errors.name && <FieldError errors={[errors.name]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="10-digit mobile"
        />
        {errors.phone && <FieldError errors={[errors.phone]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="optional@example.com"
        />
        {errors.email && <FieldError errors={[errors.email]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <Input
          id="address"
          {...register("address")}
          placeholder="Customer address"
        />
        {errors.address && <FieldError errors={[errors.address]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="creditLimit">Credit Limit (₹)</FieldLabel>
        <Input
          id="creditLimit"
          type="number"
          min="0"
          step="1"
          {...register("creditLimitRupees", { valueAsNumber: true })}
          placeholder="0 (Unlimited)"
        />
        {errors.creditLimitRupees && (
          <FieldError errors={[errors.creditLimitRupees]} />
        )}
      </Field>
    </FieldGroup>
  );
}
