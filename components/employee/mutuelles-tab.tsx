"use client";

import { useMutuelles, useCreateMutuelle, useUpdateMutuelle, useDeleteMutuelle } from "@/hooks/use-hrm";
import type { Mutuelle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const emptyForm = {
  organisme: "",
  formule: "",
  date_debut: "",
  date_fin: "",
  niveau_couverture: "",
  notes: "",
};

export function MutuellesTab({ employeeId }: { employeeId: string }) {
  const { data: mutuelles } = useMutuelles(employeeId);
  const createMutuelle = useCreateMutuelle();
  const updateMutuelle = useUpdateMutuelle();
  const deleteMutuelle = useDeleteMutuelle();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (m: Mutuelle) => {
    setForm({
      organisme: m.organisme,
      formule: m.formule || "",
      date_debut: m.date_debut,
      date_fin: m.date_fin || "",
      niveau_couverture: m.niveau_couverture || "",
      notes: m.notes || "",
    });
    setEditingId(m.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      employee_id: employeeId,
      formule: form.formule || undefined,
      date_fin: form.date_fin || undefined,
      niveau_couverture: form.niveau_couverture || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await updateMutuelle.mutateAsync({ id: editingId, ...payload });
        toast.success("Mutuelle modifiée");
      } else {
        await createMutuelle.mutateAsync(payload as any);
        toast.success("Mutuelle ajoutée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutuelle.mutateAsync(id);
      toast.success("Mutuelle supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const isActive = (m: Mutuelle) => !m.date_fin || new Date(m.date_fin) >= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mutuelles</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle mutuelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier la mutuelle" : "Nouvelle mutuelle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Organisme</Label>
                <Input value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Formule</Label>
                <Input value={form.formule} onChange={(e) => setForm({ ...form, formule: e.target.value })} />
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
                <Label>Niveau de couverture</Label>
                <Input value={form.niveau_couverture} onChange={(e) => setForm({ ...form, niveau_couverture: e.target.value })} />
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

      {mutuelles?.length === 0 ? (
        <p className="text-muted-foreground">Aucune mutuelle enregistrée</p>
      ) : (
        <div className="space-y-3">
          {mutuelles?.map((m) => (
            <div key={m.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.organisme}</span>
                  <Badge variant={isActive(m) ? "default" : "secondary"}>
                    {isActive(m) ? "Active" : "Expirée"}
                  </Badge>
                  {m.formule && <Badge variant="outline">{m.formule}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Du {format(new Date(m.date_debut), "dd/MM/yyyy")}
                  {m.date_fin && ` au ${format(new Date(m.date_fin), "dd/MM/yyyy")}`}
                </p>
                {m.niveau_couverture && <p className="text-sm text-muted-foreground">Couverture : {m.niveau_couverture}</p>}
                {m.notes && <p className="text-sm mt-1">{m.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(m.id)}>
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
