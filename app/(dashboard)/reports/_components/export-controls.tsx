"use client";

import { FileSpreadsheetIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ExportControls() {
  const month = new Date().toISOString().slice(0, 7);
  const download = (format: "tally" | "gst") => {
    const value = (document.getElementById("export-month") as HTMLInputElement)?.value || month;
    const [year, monthNumber] = value.split("-");
    if (!year || !monthNumber) return;
    const end = new Date(Number(year), Number(monthNumber), 0).getDate();
    window.location.assign(`/api/export/${format}?from=${value}-01&to=${value}-${String(end).padStart(2, "0")}`);
  };
  return <FieldGroup className="flex flex-col gap-3 sm:flex-row sm:items-end"><Field className="max-w-48"><FieldLabel htmlFor="export-month">Export month</FieldLabel><Input id="export-month" type="month" defaultValue={month} /></Field><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => download("gst")}><FileSpreadsheetIcon data-icon="inline-start" />Export for CA</Button><Button onClick={() => download("tally")}><FileTextIcon data-icon="inline-start" />Export to Tally</Button></div></FieldGroup>;
}
