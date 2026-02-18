"use client";

import { useCompanies, useEmployees, useLeaves, useSickLeaves } from "@/hooks/use-hrm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, HeartPulse, LogOut, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: companies } = useCompanies();
  const { data: employees } = useEmployees();
  const { data: leaves } = useLeaves();
  const { data: sickLeaves } = useSickLeaves();
  const router = useRouter();
  const supabase = createClient();

  const pendingLeaves = leaves?.filter((l) => l.status === "pending").length || 0;
  const currentSickLeaves = sickLeaves?.filter((sl) => {
    const now = new Date();
    return new Date(sl.start_date) <= now && new Date(sl.end_date) >= now;
  }).length || 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Claw HRM</h1>
          <p className="text-xs text-muted-foreground">SFP</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Building2 className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/dashboard/companies">
            <Button variant="ghost" className="w-full justify-start">
              <Building2 className="w-4 h-4 mr-3" />
              Entreprises
              {companies && <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">{companies.length}</span>}
            </Button>
          </Link>
          
          <Link href="/dashboard/leaves">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-3" />
              Congés
              {pendingLeaves > 0 && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">{pendingLeaves}</span>
              )}
            </Button>
          </Link>
          
          <Link href="/dashboard/sick-leaves">
            <Button variant="ghost" className="w-full justify-start">
              <HeartPulse className="w-4 h-4 mr-3" />
              Arrêts maladie
              {currentSickLeaves > 0 && (
                <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">{currentSickLeaves}</span>
              )}
            </Button>
          </Link>
          
          <Link href="/dashboard/templates">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-3" />
              Templates PDF
            </Button>
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
