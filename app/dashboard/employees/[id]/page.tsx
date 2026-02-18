"use client";

import { useParams } from "next/navigation";
import { useEmployee, useLeaves, useCreateLeave, useUpdateLeave } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Briefcase, Mail, Phone, MapPin, Calendar, Plus, Check, X, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { data: employee, isLoading } = useEmployee(employeeId);
  const { data: leaves } = useLeaves(employeeId);
  const createLeave = useCreateLeave();
  const updateLeave = useUpdateLeave();
  const [open, setOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "paid" as const,
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending" as const,
    employee_id: employeeId,
  });

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeave.mutateAsync(leaveForm);
      toast.success("Demande de congé créée");
      setOpen(false);
      setLeaveForm({
        type: "paid",
        start_date: "",
        end_date: "",
        reason: "",
        status: "pending",
        employee_id: employeeId,
      });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

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

  if (isLoading) return <p className="p-8">Chargement...</p>;
  if (!employee) return <p className="p-8">Employé non trouvé</p>;

  const totalLeaveDays = leaves?.reduce((acc, leave) => {
    if (leave.status === "approved") {
      return acc + differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
    }
    return acc;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/companies/${employee.company_id}`} className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {employee.first_name[0]}{employee.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
                <p className="text-muted-foreground">{employee.position} {employee.department && `- ${employee.department}`}</p>
                <Badge className="mt-1">{employee.company?.name}</Badge>
              </div>
            </div>
            <Link href={`/dashboard/employees/${employeeId}/documents`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="leaves">
              Congés ({leaves?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> Informations personnelles
                </h3>
                <div className="space-y-3 text-sm">
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${employee.email}`} className="text-primary hover:underline">{employee.email}</a>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {employee.phone}
                    </div>
                  )}
                  {(employee.address || employee.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {employee.address}{employee.address && employee.city && ", "}{employee.city} {employee.zip_code}
                    </div>
                  )}
                  {employee.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Né(e) le {format(new Date(employee.birth_date), "dd MMMM yyyy", { locale: fr })}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" /> Informations professionnelles
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Poste:</span> {employee.position}
                  </div>
                  {employee.department && (
                    <div>
                      <span className="text-muted-foreground">Département:</span> {employee.department}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Date d'embauche:</span>{" "}
                    {format(new Date(employee.hire_date), "dd MMMM yyyy", { locale: fr })}
                  </div>
                  {employee.contract_type && (
                    <div>
                      <span className="text-muted-foreground">Contrat:</span>{" "}
                      {employee.contract_type.toUpperCase()}
                    </div>
                  )}
                  {employee.salary && (
                    <div>
                      <span className="text-muted-foreground">Salaire annuel brut:</span>{" "}
                      {employee.salary.toLocaleString("fr-FR")} €
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Statut:</span>{" "}
                    <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                      {employee.status === "active" ? "Actif" : employee.status === "inactive" ? "Inactif" : "Terminé"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {(employee.social_security_number || employee.emergency_contact_name) && (
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-4">Informations complémentaires</h3>
                <div className="space-y-2 text-sm">
                  {employee.social_security_number && (
                    <div><span className="text-muted-foreground">Numéro de sécurité sociale:</span> {employee.social_security_number}</div>
                  )}
                  {employee.emergency_contact_name && (
                    <div>
                      <span className="text-muted-foreground">Contact d'urgence:</span>{" "}
                      {employee.emergency_contact_name} {employee.emergency_contact_phone && `(${employee.emergency_contact_phone})`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {employee.notes && (
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Congés et absences</h2>
                <p className="text-sm text-muted-foreground">
                  Total jours approuvés: <span className="font-semibold">{totalLeaveDays}</span>
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle demande
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle demande de congé</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type de congé</Label>
                      <Select
                        value={leaveForm.type}
                        onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(leaveTypes).map(([k, l]) => (
                            <SelectItem key={k} value={k}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Du</Label>
                        <Input
                          type="date"
                          value={leaveForm.start_date}
                          onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Au</Label>
                        <Input
                          type="date"
                          value={leaveForm.end_date}
                          onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Motif</Label>
                      <Input
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createLeave.isPending}>
                        {createLeave.isPending ? "Création..." : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {leaves?.length === 0 ? (
              <p className="text-muted-foreground">Aucun congé enregistré</p>
            ) : (
              <div className="space-y-3">
                {leaves?.map((leave) => {
                  const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
                  return (
                    <div key={leave.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{leaveTypes[leave.type]}</span>
                          <Badge variant={leaveStatuses[leave.status].variant}>
                            {leaveStatuses[leave.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Du {format(new Date(leave.start_date), "dd/MM/yyyy")} au{" "}
                          {format(new Date(leave.end_date), "dd/MM/yyyy")} ({days} jours)
                        </p>
                        {leave.reason && <p className="text-sm mt-1">{leave.reason}</p>}
                      </div>
                      {leave.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(leave.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(leave.id)}>
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
