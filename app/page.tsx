import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Receipt,
  Package,
  Users,
  TrendingUp,
  ChevronRight,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MotionDiv, MotionH2, MotionP } from "@/components/shared/motion/div";

const features = [
  {
    icon: Receipt,
    title: "Instant Billing",
    description:
      "Create professional GST-compliant invoices in seconds. Support for UPI QR codes.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Package,
    title: "Smart Inventory",
    description:
      "Real-time stock tracking with low-stock alerts and easy purchase recording.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: Users,
    title: "Customer Ledger",
    description:
      "Manage 'Udhaar' (credit) with automated reminders and transaction history.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Business Analytics",
    description:
      "Deep insights into sales, top products, and tax summaries for better growth.",
    color: "bg-purple-500/10 text-purple-500",
  },
];

export default function HomePage() {
  console.log("render");
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Dukaan
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:pt-32 lg:pb-24">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
              >
                <Sparkles className="h-4 w-4" />
                <span>Next-gen Retail OS for Bharat</span>
              </MotionDiv>

              <MotionH2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl"
              >
                Supercharge Your Shop with{" "}
                <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Dukaan
                </span>
              </MotionH2>

              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              >
                The all-in-one POS for modern Indian retailers. Manage billing,
                inventory, and udhaar effortlessly in one beautiful dashboard.
              </MotionP>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-8 text-lg shadow-xl shadow-primary/20"
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-24 sm:px-6">
          <div className="mb-16 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to grow
            </h3>
            <p className="mt-4 text-muted-foreground">
              Purpose-built for the unique needs of Indian retail businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <MotionDiv
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 bg-card/50 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                  <CardHeader>
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-blue-700" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h3 className="text-4xl font-bold">
                Ready to digitize your business?
              </h3>
              <p className="mt-6 text-lg text-primary-foreground/80">
                Join 1,000+ shops across India using Dukaan to run their
                business more efficiently.
              </p>
              <div className="mt-10 flex justify-center">
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 rounded-full px-10 text-lg"
                  >
                    Join Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="font-bold">Dukaan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Dukaan Retail Solutions. Built with ❤️ in India.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
