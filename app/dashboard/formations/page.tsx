"use client";

import { useFormations, useCreateFormation, useUpdateFormation, useDeleteFormation, useEmployees } from "@/hooks/use-hrm";
import type { Formation } from "@/types";
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

const statuts = {
  planifiee: { label: "Planifiée", variant: "secondary" as const },
  en_cours: { label: "En cours", variant: "default" as const },
  terminee: { label: "Terminée", variant: "outline" as const },
};

const emptyForm = {
  employee_id: "",
  intitule: "",
  organisme: "",
  date_debut: "",
  date_fin: "",
  statut: "planifiee" as const,
  certificat_url: "",
  notes: "",
};

export default function FormationsPage() {
  const { data: formations } = useFormations();
  const { data: employees } = useEmployees();
  const createFormation = useCreateFormation();
  const updateFormation = useUpdateFormation();
  const deleteFormation = useDeleteFormation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (formation: Formation) => {
    setForm({
      employee_id: formation.employee_id,
      intitule: formation.intitule,
      organisme: formation.organisme || "",
      date_debut: formation.date_debut,
      date_fin: formation.date_fin || "",
      statut: formation.statut,
      certificat_url: formation.certificat_url || "",
      notes: formation.notes || "",
    });
    setEditingId(formation.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFormation.mutateAsync({ id: editingId, ...form });
        toast.success("Formation modifiée");
      } else {
        await createFormation.mutateAsync(form);
        toast.success("Formation créée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFormation.mutateAsync(id);
      toast.success("Formation supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Formations</h1>
            <p className="text-muted-foreground">Gestion globale des formations</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une formation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la formation" : "Nouvelle formation"}</DialogTitle>
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
                <div className="space-y-2">
                  <Label>Intitulé</Label>
                  <Input value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Organisme</Label>
                  <Input value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date début</Label>
                    <Input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date fin</Label>
                    <Input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statuts).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>URL du certificat</Label>
                  <Input value={form.certificat_url} onChange={(e) => setForm({ ...form, certificat_url: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createFormation.isPending || updateFormation.isPending}>
                    {editingId ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Total formations</h3>
            <p className="text-3xl font-bold">{formations?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Planifiées</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formations?.filter(f => f.statut === 'planifiee').length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">En cours</h3>
            <p className="text-3xl font-bold text-green-600">
              {formations?.filter(f => f.statut === 'en_cours').length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Terminées</h3>
            <p className="text-3xl font-bold text-gray-600">
              {formations?.filter(f => f.statut === 'terminee').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formations?.map((formation: Formation) => (
          <div key={formation.id} className="p-4 bg-card rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{formation.intitule}</h3>
                  <Badge variant={statuts[formation.statut].variant}>
                    {statuts[formation.statut].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Date début:</span>{" "}
                      {format(new Date(formation.date_debut), "dd MMMM yyyy", { locale: fr })}
                    </p>
                    {formation.date_fin && (
                      <p>
                        <span className="font-medium">Date fin:</span>{" "}
                        {format(new Date(formation.date_fin), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Employé:</span>
                      {employees?.find(emp => emp.id === formation.employee_id) ? (
                        <Link href={`/dashboard/employees/${formation.employee_id}`} className="text-primary hover:underline ml-1">
                          {employees.find(emp => emp.id === formation.employee_id)?.last_name} {employees.find(emp => emp.id === formation.employee_id)?.first_name}
                        </Link>
                      ) : (
                        <span className="ml-1 text-muted-foreground">Employé inconnu</span>
                      )}
                    </p>
                    {formation.organisme && (
                      <p>
                        <span className="font-medium">Organisme:</span> {formation.organisme}
                      </p>
                    )}
                  </div>
                </div>
                {formation.notes && <p className="text-sm mt-2">{formation.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(formation)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(formation.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!formations?.length && (
          <p className="text-muted-foreground text-center py-8">Aucune formation enregistrée</p>
        )}
      </div>
    </div>
  );
}
