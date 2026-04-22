// app/(dashboard)/customers/_components/create-customer-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCustomerAction } from "../_lib/actions";
import {
  customerSchema,
  type CustomerInput,
  type CustomerOutput,
} from "../_lib/schema";
import { CustomerFormFields } from "./customer-form-fields";

export default function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerInput, unknown, CustomerOutput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      creditLimitRupees: 0,
    },
  });

  function onSubmit(data: CustomerOutput) {
    const toastId = toast.loading("Adding customer...");
    startTransition(async () => {
      // Pass raw input — action runs safeParse server-side
      const result = await createCustomerAction(data);

      if (result.success) {
        toast.success("Customer added successfully", { id: toastId });
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.message ?? "Something went wrong", { id: toastId });
      }
    });
  }

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
              "Save Customer"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
