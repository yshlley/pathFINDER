import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { STATUS_OPTIONS } from "@/lib/intake-constants";
import { PH_REGION_NAMES, PH_REGIONS } from "@/lib/ph-locations";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).default("signin").catch("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-semibold">
            {mode === "signup" ? t("signUpTitle") : t("signInTitle")}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">{t("tagline")}</p>

          {mode === "signup" ? (
            <SignUpForm loading={loading} setLoading={setLoading} />
          ) : (
            <SignInForm loading={loading} setLoading={setLoading} />
          )}

          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                {t("hasAccount")}{" "}
                <Link to="/auth" search={{ mode: "signin" }} className="font-medium text-primary hover:underline">
                  {t("signIn")}
                </Link>
              </>
            ) : (
              <>
                {t("noAccount")}{" "}
                <Link to="/auth" search={{ mode: "signup" }} className="font-medium text-primary hover:underline">
                  {t("signUp")}
                </Link>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          First-time setup: sign up using <code className="rounded bg-muted px-1">admin@pathfinder.local</code> to become the default administrator.
        </p>
      </main>
    </div>
  );
}

function SignInForm({ loading, setLoading }: { loading: boolean; setLoading: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(t("invalidLogin"));
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("loading") : t("signInCta")}
      </Button>
    </form>
  );
}

const signUpSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  section: z.string().trim().max(80).optional().or(z.literal("")),
  current_status: z.string().min(1),
  location_region: z.string().min(1),
  location_province: z.string().optional().or(z.literal("")),
  location_city: z.string().optional().or(z.literal("")),
  requested_role: z.enum(["student", "counselor"]).default("student"),
});

function SignUpForm({ loading, setLoading }: { loading: boolean; setLoading: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    section: "",
    current_status: STATUS_OPTIONS[0],
    location_region: PH_REGION_NAMES[0],
    location_province: "",
    location_city: "",
    requested_role: "student" as "student" | "counselor",
  });

  const provinces = form.location_region ? Object.keys(PH_REGIONS[form.location_region] ?? {}) : [];
  const cities = form.location_region && form.location_province ? PH_REGIONS[form.location_region]?.[form.location_province] ?? [] : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          section: parsed.data.section,
          current_status: parsed.data.current_status,
          location_region: parsed.data.location_region,
          location_province: parsed.data.location_province,
          location_city: parsed.data.location_city,
          requested_role: parsed.data.requested_role,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("accountCreated"));
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">{t("fullName")}</Label>
        <Input id="full_name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t("role")}</Label>
          <Select value={form.requested_role} onValueChange={(v) => setForm({ ...form, requested_role: v as "student" | "counselor" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="counselor">Counselor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="section">{t("section")}</Label>
          <Input id="section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>{t("currentStatus")}</Label>
        <Select value={form.current_status} onValueChange={(v) => setForm({ ...form, current_status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label>Region</Label>
          <Select value={form.location_region} onValueChange={(v) => setForm({ ...form, location_region: v, location_province: "", location_city: "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PH_REGION_NAMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Province</Label>
          <Select value={form.location_province} onValueChange={(v) => setForm({ ...form, location_province: v, location_city: "" })} disabled={!provinces.length}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>City</Label>
          <Select value={form.location_city} onValueChange={(v) => setForm({ ...form, location_city: v })} disabled={!cities.length}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("loading") : t("signUpCta")}
      </Button>
    </form>
  );
}
