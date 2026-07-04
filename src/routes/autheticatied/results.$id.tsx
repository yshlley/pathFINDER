import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/use-session";
import { generateRecommendations, type RecommendationResult } from "@/lib/recommendations.functions";
import { toast } from "sonner";
import { Printer, Flag, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";

const searchSchema = z.object({
  intake: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/results/$id")({
  validateSearch: searchSchema,
  component: Results,
});

function Results() {
  const { id } = Route.useParams();
  const { intake } = Route.useSearch();
  const { t } = useI18n();
  const { user } = useSession();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generate = useServerFn(generateRecommendations);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (intake === "1") {
        // id is an intake id — generate
        try {
          setLoading(true);
          const res = await generate({ data: { intake_id: id } });
          setResult(res.result as RecommendationResult);
          setPlanId(res.plan_id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to generate plan";
          setError(msg);
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      } else {
        // id is a saved plan id — load
        const { data, error } = await supabase.from("saved_plans").select("result").eq("id", id).maybeSingle();
        if (error || !data) {
          setError(error?.message ?? "Plan not found");
        } else {
          setResult(data.result as unknown as RecommendationResult);
          setPlanId(id);
        }
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, intake, user]);

  if (loading) return <Shell><Loading /></Shell>;
  if (error || !result) return <Shell><ErrorState msg={error ?? "No result"} /></Shell>;

  return <Shell><Content result={result} planId={planId} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

function Loading() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{t("generating")}</p>
    </div>
  );
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p className="font-medium text-destructive">{msg}</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
    </div>
  );
}

function Content({ result, planId }: { result: RecommendationResult; planId: string | null }) {
  const { t } = useI18n();
  const { user } = useSession();
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState("");

  const report = async () => {
    if (!user || !reportMsg.trim()) return;
    const { error } = await supabase.from("data_corrections").insert({
      user_id: user.id,
      entity_type: "saved_plan",
      entity_id: planId,
      message: reportMsg.trim(),
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Report sent to admin");
      setReportMsg("");
      setReporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />{t("printPdf")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setReporting((v) => !v)}>
            <Flag className="mr-1 h-4 w-4" />{t("reportIssue")}
          </Button>
        </div>
      </div>

      {reporting && (
        <div className="rounded-lg border border-border bg-card p-4 print:hidden">
          <Textarea placeholder="What's wrong with this info?" value={reportMsg} onChange={(e) => setReportMsg(e.target.value)} />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReporting(false)}>Cancel</Button>
            <Button size="sm" onClick={report}>Send report</Button>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("yourPaths")}</h1>
        <p className="mt-2 text-muted-foreground">{result.overview}</p>
      </header>

      {/* Comparison table */}
      <section className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Path</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Eligibility</th>
              <th className="p-3">Starting salary</th>
            </tr>
          </thead>
          <tbody>
            {result.paths.map((p, i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.duration}</td>
                <td className="p-3">{p.estimated_cost}</td>
                <td className="p-3"><EligibilityBadge value={p.eligibility} /></td>
                <td className="p-3">{p.starting_salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Path cards */}
      <div className="space-y-6">
        {result.paths.map((p, i) => <PathCard key={i} path={p} index={i + 1} />)}
      </div>

      <footer className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Note:</strong> {result.disclaimer || t("disclaimer")}
      </footer>
    </div>
  );
}

function EligibilityBadge({ value }: { value: "eligible" | "conditional" | "not_eligible" }) {
  if (value === "eligible") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"><CheckCircle2 className="h-3 w-3" />Eligible</span>;
  if (value === "conditional") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"><AlertTriangle className="h-3 w-3" />Conditional</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800"><XCircle className="h-3 w-3" />Not eligible</span>;
}

function PathCard({ path, index }: { path: RecommendationResult["paths"][number]; index: number }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 print:break-inside-avoid">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Path {index}</p>
          <h2 className="mt-1 text-2xl font-bold">{path.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{path.summary}</p>
        </div>
        <EligibilityBadge value={path.eligibility} />
      </div>

      <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
        <p><strong>Eligibility reason:</strong> {path.eligibility_reason}</p>
        {path.how_to_qualify && <p className="mt-2"><strong>How to qualify:</strong> {path.how_to_qualify}</p>}
      </div>

      <div className="grid gap-4 text-sm md:grid-cols-2">
        <Block title="Timeline">
          <ul className="space-y-1">
            {path.timeline.map((m, i) => <li key={i}><span className="font-medium">{m.when}:</span> {m.milestone}</li>)}
          </ul>
        </Block>
        <Block title="Cost breakdown">
          <ul className="space-y-1">
            {path.cost_breakdown.map((c, i) => <li key={i} className="flex justify-between"><span>{c.item}</span><span className="font-medium">{c.amount}</span></li>)}
          </ul>
        </Block>
        <Block title="Recommended schools">
          <ul className="space-y-2">
            {path.recommended_schools.map((s, i) => (
              <li key={i}><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.location} · {s.tuition_range}</div><div className="text-xs mt-1"><strong>Pros:</strong> {s.pros}</div><div className="text-xs"><strong>Cons:</strong> {s.cons}</div></li>
            ))}
          </ul>
        </Block>
        <Block title="Recommended employers">
          <ul className="space-y-2">
            {path.recommended_employers.map((e, i) => (
              <li key={i}><div className="font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.industry}</div><div className="text-xs mt-1">{e.notes}</div></li>
            ))}
          </ul>
        </Block>
        <Block title="Scholarships">
          <ul className="list-disc space-y-1 pl-4">
            {path.scholarships_available.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Block>
        <Block title="Salary">
          <p><strong>Starting:</strong> {path.starting_salary}</p>
          <p><strong>Mid-career:</strong> {path.mid_career_salary}</p>
          <p className="mt-2"><strong>Deadlines:</strong> {path.deadlines}</p>
        </Block>
        <Block title="Pros">
          <ul className="list-disc space-y-1 pl-4">
            {path.pros.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </Block>
        <Block title="Cons">
          <ul className="list-disc space-y-1 pl-4">
            {path.cons.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </Block>
      </div>

      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
        <p className="mb-2 font-medium">Next steps</p>
        <ul className="list-decimal space-y-1 pl-5">
          {path.next_steps.map((v, i) => <li key={i}>{v}</li>)}
        </ul>
      </div>
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
