"use client";

import { useLeaves, useUpdateLeave } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar, Check, X, Building2 } from "lucide-react";
import Link from "next/link";

const leaveTypes = {
  paid: "Congés payés",
  unpaid: "Sans solde",
  sick: "Maladie",
  maternity: "Maternité",
  paternity: "Paternité",
  other: "Autre",
};

const leaveStatuses = {
  pending: { label: "En attente", variant: "secondary" as const },
  approved: { label: "Approuvé", variant: "default" as const },
  rejected: { label: "Refusé", variant: "destructive" as const },
};

export default function LeavesPage() {
  const { data: leaves, isLoading } = useLeaves();
  const updateLeave = useUpdateLeave();

  const handleApprove = async (id: string) => {
    try {
      await updateLeave.mutateAsync({ id, status: "approved" });
      toast.success("Congé approuvé");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateLeave.mutateAsync({ id, status: "rejected" });
      toast.success("Congé refusé");
    } catch {
      toast.error("Erreur");
    }
  };

  const now = new Date();
  const activeLeaves = leaves?.filter((l) => {
    if (l.status !== "approved") return false;
    return new Date(l.start_date) <= now && new Date(l.end_date) >= now;
  });

  const pendingLeaves = leaves?.filter((l) => l.status === "pending");

  if (isLoading) return <p className="p-8">Chargement...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Congés et absences</h1>
      <p className="text-muted-foreground mb-8">
        Gérez les demandes de congés de tous vos employés
      </p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" />
            Congés en cours ({activeLeaves?.length || 0})
          </h3>
          {activeLeaves?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun congé en cours</p>
          ) : (
            <div className="space-y-3">
              {activeLeaves?.map((leave) => (
                <div key={leave.id} className="p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium">
                    {leave.employee?.first_name} {leave.employee?.last_name}
                  </p>
                  <p className="text-muted-foreground">
                    {leaveTypes[leave.type]} - {leave.employee?.company?.name}
                  </p>
                  <p className="text-muted-foreground">
                    Jusqu'au {format(new Date(leave.end_date), "dd MMMM", { locale: fr })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4" />
            Demandes en attente ({pendingLeaves?.length || 0})
          </h3>
          {pendingLeaves?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande en attente</p>
          ) : (
            <div className="space-y-3">
              {pendingLeaves?.slice(0, 5).map((leave) => (
                <div key={leave.id} className="p-3 bg-muted rounded-md text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {leave.employee?.first_name} {leave.employee?.last_name}
                      </p>
                      <p className="text-muted-foreground">
                        {leaveTypes[leave.type]} • {leave.employee?.company?.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleApprove(leave.id)}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleReject(leave.id)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Historique complet</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Employé</th>
              <th className="text-left p-4 text-sm font-medium">Entreprise</th>
              <th className="text-left p-4 text-sm font-medium">Type</th>
              <th className="text-left p-4 text-sm font-medium">Période</th>
              <th className="text-left p-4 text-sm font-medium">Jours</th>
              <th className="text-left p-4 text-sm font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {leaves?.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((leave) => {
              const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
              return (
                <tr key={leave.id} className="border-t">
                  <td className="p-4">
                    <Link 
                      href={`/dashboard/employees/${leave.employee_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {leave.employee?.first_name} {leave.employee?.last_name}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{leave.employee?.company?.name}</td>
                  <td className="p-4 text-sm">{leaveTypes[leave.type]}</td>
                  <td className="p-4 text-sm">
                    {format(new Date(leave.start_date), "dd/MM/yy")} - {format(new Date(leave.end_date), "dd/MM/yy")}
                  </td>
                  <td className="p-4 text-sm">{days}j</td>
                  <td className="p-4">
                    <Badge variant={leaveStatuses[leave.status].variant}>
                      {leaveStatuses[leave.status].label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
