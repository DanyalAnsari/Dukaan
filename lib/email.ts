import { Resend } from "resend";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const from = process.env.RESEND_FROM_EMAIL ?? "Dukaan <onboarding@resend.dev>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) return;
  await resend.emails.send({ from, to, subject, html });
}

export async function sendWelcomeEmail(to: string, shopName: string) {
  await send(
    to,
    `Welcome to Dukaan — ${shopName} is ready`,
    `<h2>Welcome to Dukaan!</h2><p>Your shop <strong>${shopName}</strong> is ready.</p><p>Start creating bills in seconds.</p><a href="${appUrl}/bills/new">Create your first bill</a>`
  );
}

export async function sendTrialEndingEmail(to: string, daysLeft: number) {
  await send(
    to,
    `Your Dukaan trial ends in ${daysLeft} days`,
    `<p>Your free trial ends in <strong>${daysLeft} days</strong>.</p><a href="${appUrl}/settings/billing">Upgrade now</a>`
  );
}

export async function sendPaymentFailedEmail(to: string) {
  await send(
    to,
    "Action needed — Dukaan payment failed",
    `<p>We couldn't process your Dukaan subscription payment.</p><p>Update your payment method to keep your plan active.</p><a href="${appUrl}/settings/billing">Update payment</a>`
  );
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await send(
    to,
    "Reset your Dukaan password",
    `<p>Use the link below to choose a new password. It expires in one hour.</p><a href="${url}">Reset password</a>`
  );
}

export async function sendStaffInviteEmail(to: string, shopName: string, invitationId: string) {
  await send(
    to,
    `You’ve been invited to ${shopName} on Dukaan`,
    `<p>You’ve been invited to join <strong>${shopName}</strong>.</p><a href="${appUrl}/accept-invitation/${invitationId}">Accept invitation</a>`
  );
}
