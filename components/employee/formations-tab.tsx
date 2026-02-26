"use client";

import { useFormations, useCreateFormation, useUpdateFormation, useDeleteFormation } from "@/hooks/use-hrm";
import type { Formation } from "@/types";
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

const statuts = {
  planifiee: { label: "Planifiée", variant: "secondary" as const },
  en_cours: { label: "En cours", variant: "default" as const },
  terminee: { label: "Terminée", variant: "outline" as const },
};

const emptyForm = {
  intitule: "",
  organisme: "",
  date_debut: "",
  date_fin: "",
  statut: "planifiee" as const,
  certificat_url: "",
  notes: "",
};

export function FormationsTab({ employeeId }: { employeeId: string }) {
  const { data: formations } = useFormations(employeeId);
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

  const openEdit = (f: Formation) => {
    setForm({
      intitule: f.intitule,
      organisme: f.organisme || "",
      date_debut: f.date_debut,
      date_fin: f.date_fin || "",
      statut: f.statut,
      certificat_url: f.certificat_url || "",
      notes: f.notes || "",
    });
    setEditingId(f.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      employee_id: employeeId,
      organisme: form.organisme || undefined,
      date_fin: form.date_fin || undefined,
      certificat_url: form.certificat_url || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await updateFormation.mutateAsync({ id: editingId, ...payload });
        toast.success("Formation modifiée");
      } else {
        await createFormation.mutateAsync(payload as any);
        toast.success("Formation ajoutée");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFormation.mutateAsync(id);
      toast.success("Formation supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Formations</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle formation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier la formation" : "Nouvelle formation"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

      {formations?.length === 0 ? (
        <p className="text-muted-foreground">Aucune formation enregistrée</p>
      ) : (
        <div className="space-y-3">
          {formations?.map((f) => (
            <div key={f.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{f.intitule}</span>
                  <Badge variant={statuts[f.statut].variant}>
                    {statuts[f.statut].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {f.organisme && `${f.organisme} — `}
                  Du {format(new Date(f.date_debut), "dd/MM/yyyy")}
                  {f.date_fin && ` au ${format(new Date(f.date_fin), "dd/MM/yyyy")}`}
                </p>
                {f.notes && <p className="text-sm mt-1">{f.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(f)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(f.id)}>
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
