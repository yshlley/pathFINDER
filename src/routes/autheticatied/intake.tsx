import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/use-session";
import { toast } from "sonner";
import {
  BUDGET_OPTIONS, FIELD_OPTIONS, HOBBIES_OPTIONS, MODE_OPTIONS,
  NEXT_STEP_OPTIONS, SKILLS_OPTIONS, STATUS_OPTIONS,
} from "@/lib/intake-constants";
import { PH_REGION_NAMES, PH_REGIONS } from "@/lib/ph-locations";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/intake")({
  component: Intake,
});

type State = {
  current_status: string;
  skills: string[];
  skills_other: string;
  hobbies: string[];
  hobbies_other: string;
  next_step: string;
  target_field: string;
  target_field_other: string;
  mode: string;
  budget: string;
  location_region: string;
  location_province: string;
  location_city: string;
  location_other: string;
};

const TOTAL = 8;

function Intake() {
  const { t } = useI18n();
  const { user } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState<State>({
    current_status: STATUS_OPTIONS[0],
    skills: [],
    skills_other: "",
    hobbies: [],
    hobbies_other: "",
    next_step: NEXT_STEP_OPTIONS[0],
    target_field: FIELD_OPTIONS[0],
    target_field_other: "",
    mode: MODE_OPTIONS[0],
    budget: BUDGET_OPTIONS[0],
    location_region: PH_REGION_NAMES[0],
    location_province: "",
    location_city: "",
    location_other: "",
  });

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const provinces = Object.keys(PH_REGIONS[s.location_region] ?? {});
  const cities = s.location_province ? PH_REGIONS[s.location_region]?.[s.location_province] ?? [] : [];

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from("intake_responses").insert({
      user_id: user.id,
      current_status: s.current_status,
      skills: s.skills,
      skills_other: s.skills_other || null,
      hobbies: s.hobbies,
      hobbies_other: s.hobbies_other || null,
      next_step: s.next_step,
      target_field: s.target_field,
      target_field_other: s.target_field_other || null,
      mode: s.mode,
      budget: s.budget,
      location_region: s.location_region,
      location_province: s.location_province || null,
      location_city: s.location_city || null,
      location_other: s.location_other || null,
    }).select("id").single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message ?? "Failed to save"); return; }
    navigate({ to: "/results/$id", params: { id: data.id }, search: { intake: "1" } });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("step")} {step} {t("of")} {TOTAL}</span>
            <span>{Math.round((step / TOTAL) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {step === 1 && (
            <StepBlock title="What best describes you right now?">
              <Select value={s.current_status} onValueChange={(v) => setS({ ...s, current_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock title="What are your strongest skills?">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SKILLS_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <Checkbox checked={s.skills.includes(o)} onCheckedChange={() => setS({ ...s, skills: toggle(s.skills, o) })} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <Label>{t("other")}</Label>
                <Input value={s.skills_other} onChange={(e) => setS({ ...s, skills_other: e.target.value })} />
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock title="What do you enjoy doing?">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {HOBBIES_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <Checkbox checked={s.hobbies.includes(o)} onCheckedChange={() => setS({ ...s, hobbies: toggle(s.hobbies, o) })} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <Label>{t("other")}</Label>
                <Input value={s.hobbies_other} onChange={(e) => setS({ ...s, hobbies_other: e.target.value })} />
              </div>
            </StepBlock>
          )}

          {step === 4 && (
            <StepBlock title="What do you plan to do next?">
              <Select value={s.next_step} onValueChange={(v) => setS({ ...s, next_step: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NEXT_STEP_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </StepBlock>
          )}

          {step === 5 && (
            <StepBlock title="Do you have a target career or field?">
              <Select value={s.target_field} onValueChange={(v) => setS({ ...s, target_field: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="mt-3">
                <Label>Type your own (optional)</Label>
                <Input value={s.target_field_other} onChange={(e) => setS({ ...s, target_field_other: e.target.value })} placeholder="e.g. Marine Biology" />
              </div>
            </StepBlock>
          )}

          {step === 6 && (
            <StepBlock title="Preferred study or work mode">
              <Select value={s.mode} onValueChange={(v) => setS({ ...s, mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </StepBlock>
          )}

          {step === 7 && (
            <StepBlock title="Budget and financial capacity">
              <Select value={s.budget} onValueChange={(v) => setS({ ...s, budget: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </StepBlock>
          )}

          {step === 8 && (
            <StepBlock title="Where are you located?">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label>Region</Label>
                  <Select value={s.location_region} onValueChange={(v) => setS({ ...s, location_region: v, location_province: "", location_city: "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PH_REGION_NAMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Province</Label>
                  <Select value={s.location_province} onValueChange={(v) => setS({ ...s, location_province: v, location_city: "" })} disabled={!provinces.length}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City / Municipality</Label>
                  <Select value={s.location_city} onValueChange={(v) => setS({ ...s, location_city: v })} disabled={!cities.length}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3">
                <Label>Not listed? Type here</Label>
                <Input value={s.location_other} onChange={(e) => setS({ ...s, location_other: e.target.value })} placeholder="e.g. Barangay, town" />
              </div>
            </StepBlock>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep((n) => Math.max(1, n - 1))} disabled={step === 1}>
              <ArrowLeft className="mr-1 h-4 w-4" />{t("back")}
            </Button>
            {step < TOTAL ? (
              <Button onClick={() => setStep((n) => n + 1)}>
                {t("next")}<ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={saving}>
                {saving ? t("loading") : t("finish")}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
