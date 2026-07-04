import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Admin</h1>
        <Tabs defaultValue="corrections">
          <TabsList>
            <TabsTrigger value="corrections">Corrections</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="careers">Careers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>
          <TabsContent value="corrections" className="mt-6"><Corrections /></TabsContent>
          <TabsContent value="schools" className="mt-6"><SchoolsTab /></TabsContent>
          <TabsContent value="scholarships" className="mt-6"><ScholarshipsTab /></TabsContent>
          <TabsContent value="careers" className="mt-6"><CareersTab /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
          <TabsContent value="audit" className="mt-6"><AuditTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Corrections() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("data_corrections").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("data_corrections").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No corrections yet.</p>}
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{r.entity_type} · {new Date(r.created_at).toLocaleString()}</span>
            <span className="font-medium">{r.status}</span>
          </div>
          <p className="mt-2 text-sm">{r.message}</p>
          {r.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => update(r.id, "approved")}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => update(r.id, "rejected")}>Reject</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SchoolsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Private University");
  const [city, setCity] = useState("");
  const load = async () => {
    const { data } = await supabase.from("schools").select("id,name,type,city,region").order("name");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("schools").insert({ name: name.trim(), type, city, fields: [] });
    if (error) toast.error(error.message); else { setName(""); setCity(""); load(); toast.success("Added"); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("schools").delete().eq("id", id);
    load();
  };
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 font-medium">Add school</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </div>
      </div>
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Location</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.city ?? r.region}</td>
                <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => del(r.id)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScholarshipsTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("scholarships").select("id,name,provider,amount,deadline").order("name").then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Provider</th><th className="p-3">Amount</th><th className="p-3">Deadline</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-medium">{r.name}</td>
              <td className="p-3">{r.provider}</td>
              <td className="p-3">{r.amount}</td>
              <td className="p-3">{r.deadline ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CareersTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("careers").select("id,name,field,starting_salary_min,starting_salary_max").order("name").then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Field</th><th className="p-3">Starting salary</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-medium">{r.name}</td>
              <td className="p-3">{r.field}</td>
              <td className="p-3">₱{r.starting_salary_min?.toLocaleString()}–₱{r.starting_salary_max?.toLocaleString()}/mo</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("id,full_name,section,current_status,location_region,created_at").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Section</th><th className="p-3">Status</th><th className="p-3">Region</th><th className="p-3">Joined</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3 font-medium">{r.full_name}</td>
              <td className="p-3">{r.section ?? "—"}</td>
              <td className="p-3">{r.current_status ?? "—"}</td>
              <td className="p-3">{r.location_region ?? "—"}</td>
              <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left"><tr><th className="p-3">When</th><th className="p-3">Action</th><th className="p-3">Entity</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td className="p-3 text-muted-foreground" colSpan={3}>No audit entries yet.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-3">{r.action}</td>
              <td className="p-3">{r.entity} {r.entity_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
