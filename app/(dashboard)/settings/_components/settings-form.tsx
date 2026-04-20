"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { updateShopSettingsAction } from "../_lib/actions";
import { shopSettingsSchema, type ShopSettingsSchema } from "../_lib/schema";
import { Shop } from "@/types";

interface SettingsFormProps {
  shop: Shop;
  user: any;
}

export default function SettingsForm({ shop, user }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ShopSettingsSchema>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: {
      name: shop.name || "",
      phone: shop.phone || "",
      gstin: shop.gstin || "",
      address: shop.address || "",
      invoicePrefix: shop.invoicePrefix || "INV",
    },
  });

  const onSubmit = (data: ShopSettingsSchema) => {
    startTransition(async () => {
      const result = await updateShopSettingsAction(data);

      if (result.success) {
        toast.success("Settings updated successfully");
        form.reset(data);
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>Basic details about your shop</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Shop Name</FieldLabel>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Business Name"
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="9876543210"
                    className="font-mono"
                  />
                  <FieldError errors={[form.formState.errors.phone]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="gstin">GSTIN</FieldLabel>
                  <Input
                    id="gstin"
                    {...form.register("gstin")}
                    placeholder="15-digit GSTIN"
                    className="font-mono"
                    maxLength={15}
                  />
                  <FieldError errors={[form.formState.errors.gstin]} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="Full business address"
                />
                <FieldError errors={[form.formState.errors.address]} />
              </Field>

              <Separator className="my-2" />

              <Field>
                <FieldLabel htmlFor="invoicePrefix">Invoice Prefix</FieldLabel>
                <Input
                  id="invoicePrefix"
                  {...form.register("invoicePrefix")}
                  placeholder="INV"
                  className="w-32 font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Prefix used for all future invoices.
                </p>
                <FieldError errors={[form.formState.errors.invoicePrefix]} />
              </Field>
            </FieldGroup>

            <div className="pt-4">
              <Button type="submit" disabled={isPending || !form.formState.isDirty}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="mt-1 font-mono text-sm">{user.email}</p>
          </div>
          <Separator />
          <div>
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
