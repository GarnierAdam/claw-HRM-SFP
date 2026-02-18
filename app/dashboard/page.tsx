import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Claw HRM SFP</h1>
          <nav className="flex gap-4">
            <a href="/dashboard/companies" className="text-sm font-medium hover:text-primary">
              Entreprises
            </a>
            <a href="/dashboard/leaves" className="text-sm font-medium hover:text-primary">
              Congés
            </a>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Entreprises</h3>
            <p className="text-2xl font-bold mt-2">-</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Employés</h3>
            <p className="text-2xl font-bold mt-2">-</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Congés en cours</h3>
            <p className="text-2xl font-bold mt-2">-</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Maladies ce mois</h3>
            <p className="text-2xl font-bold mt-2">-</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Bienvenue sur Claw HRM SFP</h2>
          <p className="text-muted-foreground">
            Sélectionnez une entreprise dans le menu pour commencer à gérer vos employés.
          </p>
        </div>
      </main>
    </div>
  );
}
