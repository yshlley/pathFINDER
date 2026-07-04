import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/use-session";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Plan = { id: string; title: string; created_at: string };

function Dashboard() {
  const { t } = useI18n();
  const { user } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (profile?.full_name) setName(profile.full_name);
      const { data, error } = await supabase
        .from("saved_plans")
        .select("id,title,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setPlans(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back{name ? `, ${name}` : ""}</p>
            <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          </div>
          <Button asChild size="lg">
            <Link to="/intake">
              <Plus className="mr-2 h-4 w-4" />
              {t("startNewIntake")}
            </Link>
          </Button>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("myPlans")}</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("noPlans")}</p>
              <Button asChild className="mt-4">
                <Link to="/intake">{t("startNewIntake")}</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {plans.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/results/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
