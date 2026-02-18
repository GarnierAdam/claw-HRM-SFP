"use client";

import { useSickLeaves, useCreateSickLeave, useEmployees } from "@/hooks/use-hrm";
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
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { HeartPulse, Plus, Check, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";

const sickLeaveStatuses = {
  pending: { label: "En attente", variant: "secondary" as const },
  approved: { label: "Approuvé", variant: "default" as const },
};

export default function SickLeavesPage() {
  const { data: sickLeaves, isLoading } = useSickLeaves();
  const { data: employees } = useEmployees();
  const createSickLeave = useCreateSickLeave();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    certificate_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSickLeave.mutateAsync(formData);
      toast.success("Arrêt maladie créé");
      setOpen(false);
      setFormData({ employee_id: "", start_date: "", end_date: "", reason: "", certificate_url: "" });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, employeeId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `certificates/${employeeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(filePath);

      setFormData({ ...formData, certificate_url: urlData.publicUrl });
      toast.success("Certificat uploadé");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const now = new Date();
  const currentSickLeaves = sickLeaves?.filter((sl) => {
    return new Date(sl.start_date) <= now && new Date(sl.end_date) >= now;
  });

  if (isLoading) return <p className="p-8">Chargement...</p>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Arrêts maladie</h1>
          <p className="text-muted-foreground">
            Gérez les arrêts maladie de vos employés
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel arrêt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel arrêt maladie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Employé</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} - {e.company?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Du</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Au</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motif</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              {formData.certificate_url && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-green-600">✓ Certificat uploadé</p>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={createSickLeave.isPending}>
                  {createSickLeave.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <HeartPulse className="w-4 h-4" />
            Arrêts en cours ({currentSickLeaves?.length || 0})
          </h3>
          {currentSickLeaves?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun arrêt en cours</p>
          ) : (
            <div className="space-y-3">
              {currentSickLeaves?.map((sl) => {
                const days = differenceInDays(new Date(sl.end_date), new Date(sl.start_date)) + 1;
                return (
                  <div key={sl.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {sl.employee?.first_name} {sl.employee?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sl.employee?.company?.name}
                        </p>
                      </div>
                      <Badge variant={sickLeaveStatuses[sl.status].variant}>
                        {sickLeaveStatuses[sl.status].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Jusqu'au {format(new Date(sl.end_date), "dd MMMM", { locale: fr })} ({days} jours)
                    </p>
                    {sl.reason && <p className="text-xs mt-1">{sl.reason}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Historique</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Employé</th>
              <th className="text-left p-4 text-sm font-medium">Entreprise</th>
              <th className="text-left p-4 text-sm font-medium">Période</th>
              <th className="text-left p-4 text-sm font-medium">Jours</th>
              <th className="text-left p-4 text-sm font-medium">Motif</th>
              <th className="text-left p-4 text-sm font-medium">Certificat</th>
            </tr>
          </thead>
          <tbody>
            {sickLeaves?.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((sl) => {
              const days = differenceInDays(new Date(sl.end_date), new Date(sl.start_date)) + 1;
              return (
                <tr key={sl.id} className="border-t">
                  <td className="p-4">
                    <Link 
                      href={`/dashboard/employees/${sl.employee_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {sl.employee?.first_name} {sl.employee?.last_name}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{sl.employee?.company?.name}</td>
                  <td className="p-4 text-sm">
                    {format(new Date(sl.start_date), "dd/MM/yy")} - {format(new Date(sl.end_date), "dd/MM/yy")}
                  </td>
                  <td className="p-4 text-sm">{days}j</td>
                  <td className="p-4 text-sm text-muted-foreground">{sl.reason || "-"}</td>
                  <td className="p-4">
                    {sl.certificate_url ? (
                      <a 
                        href={sl.certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Voir
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
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
