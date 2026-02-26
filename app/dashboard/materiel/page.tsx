"use client";

import { useEquipmentHandovers, useCreateEquipmentHandover, useUpdateEquipmentHandover, useDeleteEquipmentHandover, useEmployees } from "@/hooks/use-hrm";
import type { EquipmentHandover } from "@/types";
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

const etats = {
  neuf: { label: "Neuf", variant: "default" as const },
  bon: { label: "Bon état", variant: "secondary" as const },
  use: { label: "Usé", variant: "outline" as const },
  endommage: { label: "Endommagé", variant: "destructive" as const },
};

const emptyForm = {
  employee_id: "",
  designation: "",
  numero_serie: "",
  date_remise: "",
  date_retour: "",
  etat: "neuf" as const,
  notes: "",
};

export default function MaterielPage() {
  const { data: handovers } = useEquipmentHandovers();
  const { data: employees } = useEmployees();
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

  const openEdit = (handover: EquipmentHandover) => {
    setForm({
      employee_id: handover.employee_id,
      designation: handover.designation,
      numero_serie: handover.numero_serie || "",
      date_remise: handover.date_remise,
      date_retour: handover.date_retour || "",
      etat: handover.etat,
      notes: handover.notes || "",
    });
    setEditingId(handover.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateHandover.mutateAsync({ id: editingId, ...form });
        toast.success("Matériel modifié");
      } else {
        await createHandover.mutateAsync(form);
        toast.success("Matériel créé");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHandover.mutateAsync(id);
      toast.success("Matériel supprimé");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Remise de matériel</h1>
            <p className="text-muted-foreground">Gestion globale du matériel</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter du matériel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier le matériel" : "Nouvelle remise de matériel"}</DialogTitle>
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
                  <Label>Désignation</Label>
                  <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Numéro de série</Label>
                    <Input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} />
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
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Total matériel</h3>
            <p className="text-3xl font-bold">{handovers?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">En cours</h3>
            <p className="text-3xl font-bold text-green-600">
              {handovers?.filter(h => !h.date_retour).length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Retourné</h3>
            <p className="text-3xl font-bold text-blue-600">
              {handovers?.filter(h => h.date_retour).length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Endommagé</h3>
            <p className="text-3xl font-bold text-red-600">
              {handovers?.filter(h => h.etat === 'endommage').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {handovers?.map((handover: EquipmentHandover) => (
          <div key={handover.id} className="p-4 bg-card rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{handover.designation}</h3>
                  <Badge variant={etats[handover.etat].variant}>
                    {etats[handover.etat].label}
                  </Badge>
                  {handover.date_retour && <Badge variant="outline">Retourné</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Date de remise:</span>{" "}
                      {format(new Date(handover.date_remise), "dd MMMM yyyy", { locale: fr })}
                    </p>
                    {handover.numero_serie && (
                      <p><span className="font-medium">S/N:</span> {handover.numero_serie}</p>
                    )}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Employé:</span>
                      {employees?.find(emp => emp.id === handover.employee_id) ? (
                        <Link href={`/dashboard/employees/${handover.employee_id}`} className="text-primary hover:underline ml-1">
                          {employees.find(emp => emp.id === handover.employee_id)?.last_name} {employees.find(emp => emp.id === handover.employee_id)?.first_name}
                        </Link>
                      ) : (
                        <span className="ml-1 text-muted-foreground">Employé inconnu</span>
                      )}
                    </p>
                    {handover.date_retour && (
                      <p>
                        <span className="font-medium">Date de retour:</span>{" "}
                        {format(new Date(handover.date_retour), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
                {handover.notes && <p className="text-sm mt-2">{handover.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(handover)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(handover.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!handovers?.length && (
          <p className="text-muted-foreground text-center py-8">Aucun matériel enregistré</p>
        )}
      </div>
    </div>
  );
}
