"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlusIcon, UsersIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";

type Member = { id: string; role: string; user: { name: string; email: string } };
export default function StaffClient({ organizationId, initialMembers, canManage, staffLimit }: { organizationId: string | null; initialMembers: Member[]; canManage: boolean; staffLimit: number }) {
  const [members, setMembers] = useState<Member[]>(initialMembers), [email, setEmail] = useState(""), [role, setRole] = useState("member"), [open, setOpen] = useState(false), [pending, setPending] = useState(false);
  const staffCount = useMemo(() => members.filter((member) => member.role !== "owner").length, [members]);
  const load = async () => { if (!organizationId) return; const { data, error } = await authClient.organization.listMembers({ query: { organizationId } }); if (error) toast.error(error.message); else setMembers(data?.members ?? []); };
  const invite = async () => { if (!organizationId || !email || staffCount >= staffLimit) return; setPending(true); const { error } = await authClient.organization.inviteMember({ organizationId, email, role: role as "admin" | "member" }); setPending(false); if (error) return toast.error(error.message); toast.success("Invitation sent"); setEmail(""); setOpen(false); void load(); };
  const remove = async (memberId: string) => { if (!organizationId) return; const { error } = await authClient.organization.removeMember({ organizationId, memberIdOrEmail: memberId }); if (error) toast.error(error.message); else { toast.success("Staff member removed"); void load(); } };
  if (staffLimit === 0) return <Card className="max-w-2xl"><CardHeader><CardTitle>Staff accounts are on Pro</CardTitle><CardDescription>Upgrade to Pro to invite up to three staff members.</CardDescription></CardHeader><CardContent><Button asChild><a href="/settings/billing">View plans</a></Button></CardContent></Card>;
  return <div className="mx-auto flex max-w-3xl flex-col gap-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">Staff</h1><p className="text-muted-foreground">Invite managers and cashiers to your shop.</p></div>{canManage && <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button disabled={staffCount >= staffLimit}><UserPlusIcon data-icon="inline-start" />Invite staff</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Invite staff</SheetTitle><SheetDescription>Managers can manage products and reports. Cashiers can create bills.</SheetDescription></SheetHeader><div className="p-4"><FieldGroup><Field><FieldLabel htmlFor="staff-email">Email</FieldLabel><Input id="staff-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field><Field><FieldLabel>Role</FieldLabel><Select value={role} onValueChange={setRole}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="admin">Manager</SelectItem><SelectItem value="member">Cashier</SelectItem></SelectGroup></SelectContent></Select></Field><Button disabled={pending || !email} onClick={invite}>{pending && <Spinner data-icon="inline-start" />}Send invitation</Button></FieldGroup></div></SheetContent></Sheet>}</div><Card><CardHeader><CardTitle>Team members</CardTitle><CardDescription>{staffCount} of {staffLimit} staff accounts in use</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{members.length ? members.map((member) => <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0" key={member.id}><div><p className="font-medium">{member.user.name}</p><p className="text-sm text-muted-foreground">{member.user.email}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{member.role === "admin" ? "Manager" : member.role === "owner" ? "Owner" : "Cashier"}</Badge>{canManage && member.role !== "owner" && <Button variant="ghost" size="sm" onClick={() => remove(member.id)}>Remove</Button>}</div></div>) : <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"><UsersIcon aria-hidden /><p>No team members yet.</p></div>}</CardContent></Card></div>;
}
