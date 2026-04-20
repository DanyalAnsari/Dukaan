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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCustomerAction } from "../_lib/actions";
import { customerSchema, type CustomerSchema } from "../_lib/schema";

export default function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      creditLimitPaise: 0,
    },
  });

  const onSubmit = (data: CustomerSchema) => {
    startTransition(async () => {
      const result = await createCustomerAction(data);

      if (result.success) {
        toast.success("Customer added successfully");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
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
              "Save Customer"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
