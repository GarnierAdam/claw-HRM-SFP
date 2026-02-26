"use client";

import { useEquipmentHandovers, useCreateEquipmentHandover, useUpdateEquipmentHandover, useDeleteEquipmentHandover } from "@/hooks/use-hrm";
import type { EquipmentHandover } from "@/types";
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

const etats = {
  neuf: { label: "Neuf", variant: "default" as const },
  bon: { label: "Bon état", variant: "secondary" as const },
  use: { label: "Usé", variant: "outline" as const },
  endommage: { label: "Endommagé", variant: "destructive" as const },
};

const emptyForm = {
  designation: "",
  numero_serie: "",
  date_remise: "",
  date_retour: "",
  etat: "neuf" as const,
  notes: "",
};

export function MaterielTab({ employeeId }: { employeeId: string }) {
  const { data: handovers } = useEquipmentHandovers(employeeId);
  const createHandover = useCreateEquipmentHandover();
  const updateHandover = useUpdateEquipmentHandover();
  const deleteHandover = useDeleteEquipmentHandover();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (h: EquipmentHandover) => {
    setForm({
      designation: h.designation,
      numero_serie: h.numero_serie || "",
      date_remise: h.date_remise,
      date_retour: h.date_retour || "",
      etat: h.etat,
      notes: h.notes || "",
    });
    setEditingId(h.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      employee_id: employeeId,
      numero_serie: form.numero_serie || undefined,
      date_retour: form.date_retour || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await updateHandover.mutateAsync({ id: editingId, ...payload });
        toast.success("Matériel modifié");
      } else {
        await createHandover.mutateAsync(payload as any);
        toast.success("Matériel ajouté");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHandover.mutateAsync(id);
      toast.success("Matériel supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Remise de matériel</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau matériel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier le matériel" : "Nouvelle remise de matériel"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Désignation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Numéro de série</Label>
                <Input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de remise</Label>
                  <Input type="date" value={form.date_remise} onChange={(e) => setForm({ ...form, date_remise: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Date de retour</Label>
                  <Input type="date" value={form.date_retour} onChange={(e) => setForm({ ...form, date_retour: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>État</Label>
                <Select value={form.etat} onValueChange={(v) => setForm({ ...form, etat: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(etats).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createHandover.isPending || updateHandover.isPending}>
                  {editingId ? "Modifier" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {handovers?.length === 0 ? (
        <p className="text-muted-foreground">Aucun matériel enregistré</p>
      ) : (
        <div className="space-y-3">
          {handovers?.map((h) => (
            <div key={h.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{h.designation}</span>
                  <Badge variant={etats[h.etat].variant}>
                    {etats[h.etat].label}
                  </Badge>
                  {h.date_retour && <Badge variant="outline">Retourné</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Remis le {format(new Date(h.date_remise), "dd/MM/yyyy")}
                  {h.date_retour && ` — Retourné le ${format(new Date(h.date_retour), "dd/MM/yyyy")}`}
                </p>
                {h.numero_serie && <p className="text-sm text-muted-foreground">S/N : {h.numero_serie}</p>}
                {h.notes && <p className="text-sm mt-1">{h.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(h)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(h.id)}>
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
