"use client";

import { useMutuelles, useCreateMutuelle, useUpdateMutuelle, useDeleteMutuelle, useEmployees } from "@/hooks/use-hrm";
import type { Mutuelle } from "@/types";
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

const emptyForm = {
  employee_id: "",
  organisme: "",
  formule: "",
  date_debut: "",
  date_fin: "",
  niveau_couverture: "",
  notes: "",
};

export default function MutuellesPage() {
  const { data: mutuelles } = useMutuelles();
  const { data: employees } = useEmployees();
  const createMutuelle = useCreateMutuelle();
  const updateMutuelle = useUpdateMutuelle();
  const deleteMutuelle = useDeleteMutuelle();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isActive = (m: Mutuelle) => !m.date_fin || new Date(m.date_fin) >= new Date();

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (mutuelle: Mutuelle) => {
    setForm({
      employee_id: mutuelle.employee_id,
      organisme: mutuelle.organisme,
      formule: mutuelle.formule || "",
      date_debut: mutuelle.date_debut,
      date_fin: mutuelle.date_fin || "",
      niveau_couverture: mutuelle.niveau_couverture || "",
      notes: mutuelle.notes || "",
    });
    setEditingId(mutuelle.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutuelle.mutateAsync({ id: editingId, ...form });
        toast.success("Mutuelle modifiée");
      } else {
        await createMutuelle.mutateAsync(form);
        toast.success("Mutuelle créée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutuelle.mutateAsync(id);
      toast.success("Mutuelle supprimée");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mutuelles</h1>
            <p className="text-muted-foreground">Gestion globale des mutuelles</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une mutuelle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier la mutuelle" : "Nouvelle mutuelle"}</DialogTitle>
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
                  <Label>Organisme</Label>
                  <Input value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formule</Label>
                    <Input value={form.formule} onChange={(e) => setForm({ ...form, formule: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau de couverture</Label>
                    <Input value={form.niveau_couverture} onChange={(e) => setForm({ ...form, niveau_couverture: e.target.value })} />
                  </div>
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
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutuelle.isPending || updateMutuelle.isPending}>
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
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Total mutuelles</h3>
            <p className="text-3xl font-bold">{mutuelles?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Mutuelles actives</h3>
            <p className="text-3xl font-bold text-green-600">
              {mutuelles?.filter(isActive).length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Mutuelles expirées</h3>
            <p className="text-3xl font-bold text-red-600">
              {mutuelles?.filter(m => !isActive(m)).length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mutuelles?.map((mutuelle: Mutuelle) => (
          <div key={mutuelle.id} className="p-4 bg-card rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{mutuelle.organisme}</h3>
                  <Badge variant={isActive(mutuelle) ? "default" : "secondary"}>
                    {isActive(mutuelle) ? "Active" : "Expirée"}
                  </Badge>
                  {mutuelle.formule && <Badge variant="outline">{mutuelle.formule}</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Date début:</span>{" "}
                      {format(new Date(mutuelle.date_debut), "dd MMMM yyyy", { locale: fr })}
                    </p>
                    {mutuelle.date_fin && (
                      <p>
                        <span className="font-medium">Date fin:</span>{" "}
                        {format(new Date(mutuelle.date_fin), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Employé:</span>
                      {employees?.find(emp => emp.id === mutuelle.employee_id) ? (
                        <Link href={`/dashboard/employees/${mutuelle.employee_id}`} className="text-primary hover:underline ml-1">
                          {employees.find(emp => emp.id === mutuelle.employee_id)?.last_name} {employees.find(emp => emp.id === mutuelle.employee_id)?.first_name}
                        </Link>
                      ) : (
                        <span className="ml-1 text-muted-foreground">Employé inconnu</span>
                      )}
                    </p>
                    {mutuelle.niveau_couverture && (
                      <p>
                        <span className="font-medium">Couverture:</span> {mutuelle.niveau_couverture}
                      </p>
                    )}
                  </div>
                </div>
                {mutuelle.notes && <p className="text-sm mt-2">{mutuelle.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(mutuelle)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(mutuelle.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!mutuelles?.length && (
          <p className="text-muted-foreground text-center py-8">Aucune mutuelle enregistrée</p>
        )}
      </div>
    </div>
  );
}
