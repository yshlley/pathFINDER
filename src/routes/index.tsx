import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Compass, GraduationCap, ShieldCheck, Scale, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Compass className="h-3.5 w-3.5" />
                {t("tagline")}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t("heroHeadline")}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {t("heroSub")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth" search={{ mode: "signin" }}>{t("haveAccount")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: GraduationCap, title: t("featureA"), desc: t("featureADesc") },
              { Icon: ShieldCheck, title: t("featureB"), desc: t("featureBDesc") },
              { Icon: Scale, title: t("featureC"), desc: t("featureCDesc") },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sources */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Verified sources</p>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground">
              DepEd · CHED · TESDA · DOST · PRC · CAAP · MARINA · UniFAST · DOLE · PAASCU · AACCUP · PMA · PMMA · PNPA · PhilJobNet
            </p>
          </div>
        </section>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathFinder AI · Built for Sisters of Mary School
        </footer>
      </main>
    </div>
  );
}
