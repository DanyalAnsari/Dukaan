"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCustomerAction } from "../../_lib/actions";
import { customerSchema, type CustomerInput, type CustomerOutput } from "../../_lib/schema";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    creditLimitPaise: number;
  };
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
}: EditCustomerDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerInput, any, CustomerOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      creditLimitPaise: customer.creditLimitPaise || 0,
    },
  });

  const onSubmit = (data: CustomerOutput) => {
    startTransition(async () => {
      const result = await updateCustomerAction(customer.id, data);

      if (result.success) {
        toast.success("Customer updated successfully");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="e.g. Rahul Sharma"
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="10 digit mobile"
              />
              <FieldError errors={[form.formState.errors.phone]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="optional@example.com"
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Customer address"
              />
              <FieldError errors={[form.formState.errors.address]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="creditLimit">Credit Limit (₹)</FieldLabel>
              <Input
                id="creditLimit"
                type="number"
                {...form.register("creditLimitPaise", { valueAsNumber: true })}
                placeholder="0 (Unlimited)"
              />
              <FieldError errors={[form.formState.errors.creditLimitPaise]} />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update Customer"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}