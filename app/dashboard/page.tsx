"use client";

import { useCompanies, useEmployees, useLeaves, useSickLeaves } from "@/hooks/use-hrm";
import { Building2, Users, Calendar, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: leaves } = useLeaves();
  const { data: sickLeaves } = useSickLeaves();

  const now = new Date();
  
  const activeLeaves = leaves?.filter((l) => {
    if (l.status !== "approved") return false;
    return new Date(l.start_date) <= now && new Date(l.end_date) >= now;
  }).length || 0;

  const currentMonthSickLeaves = sickLeaves?.filter((sl) => {
    const startMonth = new Date(sl.start_date).getMonth();
    const startYear = new Date(sl.start_date).getFullYear();
    return startMonth === now.getMonth() && startYear === now.getFullYear();
  }).length || 0;

  const pendingLeaves = leaves?.filter((l) => l.status === "pending").length || 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
      <p className="text-muted-foreground mb-8">
        Vue d'ensemble de votre gestion RH
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/companies">
          <div className="p-6 bg-card rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Entreprises</h3>
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-2">
              {companiesLoading ? "..." : companies?.length || 0}
            </p>
          </div>
        </Link>
        
        <div className="p-6 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Employés</h3>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {employeesLoading ? "..." : employees?.length || 0}
          </p>
        </div>
        
        <Link href="/dashboard/leaves">
          <div className="p-6 bg-card rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Congés en cours</h3>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-2">{activeLeaves}</p>
            {pendingLeaves > 0 && (
              <p className="text-xs text-primary mt-1">{pendingLeaves} en attente</p>
            )}
          </div>
        </Link>
        
        <Link href="/dashboard/sick-leaves">
          <div className="p-6 bg-card rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Arrêts ce mois</h3>
              <HeartPulse className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-2">{currentMonthSickLeaves}</p>
          </div>
        </Link>
      </div>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <Link href="/dashboard/companies">
              <div className="p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                <p className="font-medium">Gérer les entreprises</p>
                <p className="text-sm text-muted-foreground">Ajouter ou modifier une entreprise</p>
              </div>
            </Link>
            <Link href="/dashboard/templates">
              <div className="p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                <p className="font-medium">Templates PDF</p>
                <p className="text-sm text-muted-foreground">Créer des documents personnalisés</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="font-semibold mb-4">Informations</h2>
          <p className="text-sm text-muted-foreground">
            Claw HRM SFP vous permet de gérer plusieurs entreprises, leurs employés, 
            les congés, les arrêts maladie et de générer des documents PDF personnalisés.
          </p>
        </div>
      </div>
    </div>
  );
}
