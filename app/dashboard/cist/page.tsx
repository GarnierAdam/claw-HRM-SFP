"use client";

import { useMedicalVisits, useCreateMedicalVisit, useUpdateMedicalVisit, useDeleteMedicalVisit, useEmployees } from "@/hooks/use-hrm";
import type { MedicalVisit } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const visitTypes = {
  embauche: "Embauche",
  periodique: "Périodique",
  reprise: "Reprise",
};

const resultats = {
  apte: { label: "Apte", variant: "default" as const },
  inapte: { label: "Inapte", variant: "destructive" as const },
  restrictions: { label: "Restrictions", variant: "secondary" as const },
};

const emptyForm = {
  employee_id: "",
  date_visite: "",
  type: "periodique" as const,
  medecin: "",
  resultat: "" as string,
  prochaine_visite: "",
  notes: "",
};

export default function CistPage() {
  const { data: visits } = useMedicalVisits();
  const { data: employees } = useEmployees();
  const createVisit = useCreateMedicalVisit();
  const updateVisit = useUpdateMedicalVisit();
  const deleteVisit = useDeleteMedicalVisit();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (visit: MedicalVisit) => {
    setForm({
      employee_id: visit.employee_id,
      date_visite: visit.date_visite,
      type: visit.type,
      medecin: visit.medecin || "",
      resultat: visit.resultat || "",
      prochaine_visite: visit.prochaine_visite || "",
      notes: visit.notes || "",
    });
    setEditingId(visit.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateVisit.mutateAsync({ id: editingId, ...form });
        toast.success("Visite modifiée");
      } else {
        await createVisit.mutateAsync(form);
        toast.success("Visite créée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVisit.mutateAsync(id);
      toast.success("Visite supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Visites médicales (CIST)</h1>
            <p className="text-muted-foreground">Gestion globale des visites médicales</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une visite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la visite" : "Nouvelle visite médicale"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Employé</Label>
                  <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.last_name} {emp.first_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de visite</Label>
                    <Input type="date" value={form.date_visite} onChange={(e) => setForm({ ...form, date_visite: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(visitTypes).map(([k, l]) => (
                          <SelectItem key={k} value={k}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Médecin</Label>
                  <Input value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Résultat</Label>
                    <Select value={form.resultat} onValueChange={(v) => setForm({ ...form, resultat: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(resultats).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prochaine visite</Label>
                    <Input type="date" value={form.prochaine_visite} onChange={(e) => setForm({ ...form, prochaine_visite: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createVisit.isPending || updateVisit.isPending}>
                    {editingId ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Total visites</h3>
            <p className="text-3xl font-bold">{visits?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Apte</h3>
            <p className="text-3xl font-bold text-green-600">
              {visits?.filter(v => v.resultat === 'apte').length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">À venir</h3>
            <p className="text-3xl font-bold text-blue-600">
              {visits?.filter(v => v.prochaine_visite && new Date(v.prochaine_visite) > new Date()).length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visits?.map((visit: MedicalVisit) => (
          <div key={visit.id} className="p-4 bg-card rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{visitTypes[visit.type]}</h3>
                  {visit.resultat && (
                    <Badge variant={resultats[visit.resultat].variant}>
                      {resultats[visit.resultat].label}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p><span className="font-medium">Date:</span> {format(new Date(visit.date_visite), "dd MMMM yyyy", { locale: fr })}</p>
                    {visit.medecin && <p><span className="font-medium">Médecin:</span> Dr {visit.medecin}</p>}
                  </div>
                  <div>
                    <p><span className="font-medium">Employé:</span>
                      {employees?.find(emp => emp.id === visit.employee_id) ? (
                        <Link href={`/dashboard/employees/${visit.employee_id}`} className="text-primary hover:underline ml-1">
                          {employees.find(emp => emp.id === visit.employee_id)?.last_name} {employees.find(emp => emp.id === visit.employee_id)?.first_name}
                        </Link>
                      ) : (
                        <span className="ml-1 text-muted-foreground">Employé inconnu</span>
                      )}
                    </p>
                    {visit.prochaine_visite && (
                      <p><span className="font-medium">Prochaine:</span> {format(new Date(visit.prochaine_visite), "dd MMMM yyyy", { locale: fr })}</p>
                    )}
                  </div>
                </div>
                {visit.notes && <p className="text-sm mt-2">{visit.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(visit)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(visit.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!visits?.length && (
          <p className="text-muted-foreground text-center py-8">Aucune visite médicale enregistrée</p>
        )}
      </div>
    </div>
  );
}
