"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  customerSchema,
  type CustomerInput,
  type CustomerOutput,
} from "../../_lib/schema";
import { updateCustomerAction } from "../../_lib/actions";
import { CustomerFormFields } from "../../_components/customer-form-fields";

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

  const form = useForm<CustomerInput, unknown, CustomerOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      creditLimitRupees: customer.creditLimitPaise / 100, // paise → rupees for display
    },
  });

  function onSubmit(data: CustomerOutput) {
    startTransition(async () => {
      const result = await updateCustomerAction(customer.id, data);

      if (result.success) {
        toast.success("Customer updated successfully");
        onOpenChange(false);
      } else {
        toast.error(result.message ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <CustomerFormFields form={form} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving…
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
