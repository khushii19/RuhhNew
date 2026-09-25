"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Cake } from "@phosphor-icons/react";
import { addDays, todayISO } from "@/lib/availability";
import { isValidPhone, waLink } from "@/lib/format";
import type { Settings } from "@/lib/types";

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Baby shower", "Corporate", "Other"];

export function EnquiryForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({ name: "", phone: "", occasion: "Birthday", eventDate: "", servings: "", description: "", budget: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const minDate = addDays(todayISO(), 2);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!isValidPhone(form.phone)) errs.phone = "Please enter a valid WhatsApp number.";
    if (form.description.trim().length < 10) errs.description = "Tell us a little more about the cake.";
    if (form.eventDate && form.eventDate < minDate) errs.eventDate = "Custom cakes need at least 48 hours notice.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          occasion: form.occasion,
          eventDate: form.eventDate || undefined,
          servings: form.servings.trim() || undefined,
          description: form.description.trim(),
          budget: form.budget ? Number(form.budget) : undefined,
          website: form.website,
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setErrors({ form: json.error ?? "Something went wrong. Please try again." });
        return;
      }
      setDone({ id: json.id });
      window.open(waLink(settings.whatsapp_number, waText()), "_blank", "noopener");
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  function waText() {
    return `Hi ${settings.owner_name}! I'd like a custom cake.\n\nOccasion: ${form.occasion}\nDate: ${form.eventDate || "flexible"}\nServings: ${form.servings || "-"}\nBudget: ${form.budget ? "AED " + form.budget : "-"}\n\n${form.description}\n\n${form.name} (${form.phone})`;
  }

  if (done) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-sage-mid bg-sage/40 p-7 text-center">
        <Cake size={40} className="mx-auto text-sage-deep" aria-hidden />
        <h2 className="mb-2 mt-3 text-[26px]">Enquiry sent</h2>
        <p className="mx-auto mb-5 max-w-[42ch] text-[14.5px] leading-relaxed text-muted">{settings.owner_name} will reply on WhatsApp with a quote. If WhatsApp didn&apos;t open, tap below.</p>
        <a href={waLink(settings.whatsapp_number, waText())} target="_blank" rel="noopener noreferrer" className="btn-wa">
          <WhatsAppIcon /> Open WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 md:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className={`field ${errors.name ? "field-err" : ""}`} value={form.name} onChange={set("name")} />
          {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name}</p>}
        </div>
        <div>
          <label className="label">WhatsApp number</label>
          <input className={`field ${errors.phone ? "field-err" : ""}`} type="tel" value={form.phone} onChange={set("phone")} placeholder="+971 50 000 0000" />
          {errors.phone && <p className="mt-1 text-[11px] text-danger">{errors.phone}</p>}
        </div>
        <div>
          <label className="label">Occasion</label>
          <select className="field" value={form.occasion} onChange={set("occasion")}>
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Event date</label>
          <input className={`field ${errors.eventDate ? "field-err" : ""}`} type="date" min={minDate} value={form.eventDate} onChange={set("eventDate")} />
          {errors.eventDate && <p className="mt-1 text-[11px] text-danger">{errors.eventDate}</p>}
        </div>
        <div>
          <label className="label">Servings</label>
          <input className="field" value={form.servings} onChange={set("servings")} placeholder="e.g. 12–15 people" />
        </div>
        <div>
          <label className="label">Budget (AED, optional)</label>
          <input className="field" type="number" min={0} value={form.budget} onChange={set("budget")} />
        </div>
      </div>
      <div className="mt-3">
        <label className="label">Describe your cake</label>
        <textarea
          className={`field min-h-[110px] ${errors.description ? "field-err" : ""}`}
          value={form.description}
          onChange={set("description")}
          placeholder="Flavours, design, colours, theme, dietary needs, text on the cake…"
        />
        {errors.description && <p className="mt-1 text-[11px] text-danger">{errors.description}</p>}
      </div>
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </label>
      </div>
      {errors.form && <p className="mt-2 rounded-[10px] bg-danger/10 p-3 text-[12px] text-danger">{errors.form}</p>}
      <button className="btn-wa mt-4" disabled={busy}>
        <WhatsAppIcon /> {busy ? "Sending…" : `Send enquiry to ${settings.owner_name}`}
      </button>
    </form>
  );
}
