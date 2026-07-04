import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/counselor")({
  component: CounselorPage,
});

function CounselorPage() {
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("id,full_name,section,current_status,created_at").order("created_at", { ascending: false }).then(({ data }) => setStudents(data ?? []));
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Counselor · Students</h1>
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Section</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.full_name}</td>
                  <td className="p-3">{s.section ?? "—"}</td>
                  <td className="p-3">{s.current_status ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
