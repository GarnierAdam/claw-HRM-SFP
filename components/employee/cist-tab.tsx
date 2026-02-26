"use client";

import { useMedicalVisits, useCreateMedicalVisit, useUpdateMedicalVisit, useDeleteMedicalVisit } from "@/hooks/use-hrm";
import type { MedicalVisit } from "@/types";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

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
  date_visite: "",
  type: "periodique" as const,
  medecin: "",
  resultat: "" as string,
  prochaine_visite: "",
  notes: "",
};

export function CistTab({ employeeId }: { employeeId: string }) {
  const { data: visits } = useMedicalVisits(employeeId);
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
    const payload = {
      ...form,
      employee_id: employeeId,
      resultat: form.resultat || undefined,
      prochaine_visite: form.prochaine_visite || undefined,
      medecin: form.medecin || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await updateVisit.mutateAsync({ id: editingId, ...payload });
        toast.success("Visite médicale modifiée");
      } else {
        await createVisit.mutateAsync(payload as any);
        toast.success("Visite médicale ajoutée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVisit.mutateAsync(id);
      toast.success("Visite médicale supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visites médicales (CIST)</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle visite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier la visite" : "Nouvelle visite médicale"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

      {visits?.length === 0 ? (
        <p className="text-muted-foreground">Aucune visite médicale enregistrée</p>
      ) : (
        <div className="space-y-3">
          {visits?.map((visit) => (
            <div key={visit.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{visitTypes[visit.type]}</span>
                  {visit.resultat && (
                    <Badge variant={resultats[visit.resultat].variant}>
                      {resultats[visit.resultat].label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(visit.date_visite), "dd/MM/yyyy")}
                  {visit.medecin && ` — Dr ${visit.medecin}`}
                </p>
                {visit.prochaine_visite && (
                  <p className="text-sm text-muted-foreground">
                    Prochaine visite : {format(new Date(visit.prochaine_visite), "dd/MM/yyyy")}
                  </p>
                )}
                {visit.notes && <p className="text-sm mt-1">{visit.notes}</p>}
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
          ))}
        </div>
      )}
    </div>
  );
}
