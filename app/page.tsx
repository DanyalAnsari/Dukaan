import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeIndianRupeeIcon,
  BarChart3Icon,
  CheckIcon,
  FileTextIcon,
  PackageIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
} from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dukaan — Billing, udhar, inventory",
};

const problems = [
  {
    icon: BadgeIndianRupeeIcon,
    title: "Udhar ka hisaab",
    copy: "See every customer balance, record payments, and send WhatsApp reminders before dues slip.",
  },
  {
    icon: FileTextIcon,
    title: "GST invoice banana",
    copy: "Create a professional GST invoice with HSN, CGST/SGST split, UPI QR, and PDF in seconds.",
  },
  {
    icon: PackageIcon,
    title: "Stock khatam pata nahi",
    copy: "Track inventory as you bill and catch low-stock items before they leave the shelf empty.",
  },
];
const plans = [
  {
    name: "Free",
    price: "₹0",
    note: "For getting started",
    items: ["50 bills/month", "50 products", "100 customers"],
  },
  {
    name: "Starter",
    price: "₹299",
    note: "For growing shops",
    items: ["500 bills/month", "500 products", "PDF invoices"],
  },
  {
    name: "Pro",
    price: "₹799",
    note: "For your whole business",
    items: [
      "Unlimited bills & products",
      "GST reports & exports",
      "3 staff accounts",
      "Tally export",
    ],
    featured: true,
  },
];
const workflow = [
  { icon: ReceiptTextIcon, label: "Fast billing" },
  { icon: UsersRoundIcon, label: "Clear customer ledger" },
  { icon: BarChart3Icon, label: "Ready for your CA" },
];

function AppPreview() {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon-192.png"
              alt=""
              width={28}
              height={28}
              className="size-7 rounded"
            />
            <span className="font-heading font-semibold">Dukaan</span>
          </div>
          <Badge variant="secondary">New bill</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr]">
        <Card className="border-dashed shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Today’s bill</CardTitle>
            <CardDescription>Walk-in customer</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span>Fortune Sunflower Oil</span>
              <span className="font-mono">₹1,260</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Parle-G Biscuits × 4</span>
              <span className="font-mono">₹40</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span className="font-mono">₹1,300</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardDescription>Today’s sales</CardDescription>
              <CardTitle className="font-mono text-2xl">₹12,450</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardDescription>Low stock</CardDescription>
              <CardTitle className="text-base">
                3 products need attention
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <section className="overflow-hidden border-b">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:items-center lg:py-24">
            <div className="flex flex-col items-start gap-6">
              <Badge variant="secondary">Made for Indian kiranas</Badge>
              <h1 className="max-w-2xl font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
                Billing, udhar, inventory —{" "}
                <span className="text-primary">sab ek jagah.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Built for Indian kiranas. GST-compliant invoices in seconds,
                with the day-to-day controls your shop actually needs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start free — no credit card needed
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#pricing">See plans</Link>
                </Button>
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheckIcon />
                Free forever on the Free plan.
              </p>
            </div>
            <AppPreview />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-medium text-primary">Made for the counter</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              The shop problems that cost time, handled.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {problems.map(({ icon: Icon, title, copy }) => (
              <Card
                key={title}
                className="transition-transform hover:-translate-y-1"
              >
                <CardHeader className="gap-4">
                  <Icon className="size-7 text-primary" />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="leading-6">
                    {copy}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link
                    className="text-sm font-medium text-primary hover:underline"
                    href="/signup"
                  >
                    Try it free
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        <section className="border-y bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:py-24">
            <div>
              <p className="font-medium text-primary">One calm dashboard</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
                Less hunting for numbers. More time at the counter.
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Bills, payments, stock, customers, and reports stay connected so
                the day’s work is already organised when you need it.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {workflow.map(({ icon: Icon, label }) => (
                <Card key={label} className="bg-card">
                  <CardHeader className="gap-3">
                    <Icon className="size-6 text-primary" />
                    <CardTitle className="text-base">{label}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section
          id="pricing"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-medium text-primary">Simple pricing</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              Choose what fits your shop today.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Upgrade when you need more room. No credit card for the Free plan.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.featured ? "border-primary shadow-lg" : undefined
                }
              >
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.featured && <Badge>Most complete</Badge>}
                  </div>
                  <CardDescription>{plan.note}</CardDescription>
                  <p className="font-mono text-3xl font-semibold text-foreground">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.price === "₹0" ? " forever" : "/month"}
                    </span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckIcon className="size-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                  >
                    <Link href="/signup">Start free</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="items-center gap-4 px-6 py-12 text-center sm:px-12">
              <Badge variant="secondary">Early access</Badge>
              <CardTitle className="max-w-2xl text-3xl sm:text-4xl">
                Be among our first 100 shops.
              </CardTitle>
              <CardDescription className="max-w-xl text-primary-foreground/80">
                Start on the Free plan today. Your counter deserves software
                that keeps up.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-12">
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">
                  Start free — no credit card needed
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
