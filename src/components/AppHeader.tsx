import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/use-session";
import { Button } from "@/components/ui/button";
import { Compass, LogOut } from "lucide-react";

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, isCounselor } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">{t("appName")}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">{t("dashboard")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/intake">{t("intake")}</Link>
              </Button>
              {isCounselor && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/counselor">{t("counselor")}</Link>
                </Button>
              )}
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">{t("admin")}</Link>
                </Button>
              )}
            </>
          )}
          <div className="mx-2 flex items-center rounded-md border border-border p-0.5">
            <button
              onClick={() => setLang("en")}
              className={`rounded px-2 py-0.5 text-xs font-medium ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("tl")}
              className={`rounded px-2 py-0.5 text-xs font-medium ${lang === "tl" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              TL
            </button>
          </div>
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-1 h-3.5 w-3.5" />
              {t("signOut")}
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth" search={{ mode: "signin" }}>{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>{t("signUp")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
