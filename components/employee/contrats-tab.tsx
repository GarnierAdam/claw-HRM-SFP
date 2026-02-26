"use client";

import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from "@/hooks/use-hrm";
import type { Contract } from "@/types";
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

const contractTypes = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
  autre: "Autre",
};

const emptyForm = {
  type: "cdi" as const,
  date_debut: "",
  date_fin: "",
  salaire: "",
  document_url: "",
  notes: "",
};

export function ContratsTab({ employeeId }: { employeeId: string }) {
  const { data: contracts } = useContracts(employeeId);
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (c: Contract) => {
    setForm({
      type: c.type,
      date_debut: c.date_debut,
      date_fin: c.date_fin || "",
      salaire: c.salaire?.toString() || "",
      document_url: c.document_url || "",
      notes: c.notes || "",
    });
    setEditingId(c.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      employee_id: employeeId,
      salaire: form.salaire ? parseFloat(form.salaire) : undefined,
      date_fin: form.date_fin || undefined,
      document_url: form.document_url || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await updateContract.mutateAsync({ id: editingId, ...payload });
        toast.success("Contrat modifié");
      } else {
        await createContract.mutateAsync(payload as any);
        toast.success("Contrat ajouté");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContract.mutateAsync(id);
      toast.success("Contrat supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const isActive = (c: Contract) => !c.date_fin || new Date(c.date_fin) >= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contrats</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contrat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier le contrat" : "Nouveau contrat"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(contractTypes).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Salaire brut annuel</Label>
                <Input type="number" value={form.salaire} onChange={(e) => setForm({ ...form, salaire: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL du document</Label>
                <Input value={form.document_url} onChange={(e) => setForm({ ...form, document_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createContract.isPending || updateContract.isPending}>
                  {editingId ? "Modifier" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contracts?.length === 0 ? (
        <p className="text-muted-foreground">Aucun contrat enregistré</p>
      ) : (
        <div className="space-y-3">
          {contracts?.map((c) => (
            <div key={c.id} className="p-4 bg-card rounded-lg border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{contractTypes[c.type]}</span>
                  <Badge variant={isActive(c) ? "default" : "secondary"}>
                    {isActive(c) ? "En cours" : "Terminé"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Du {format(new Date(c.date_debut), "dd/MM/yyyy")}
                  {c.date_fin && ` au ${format(new Date(c.date_fin), "dd/MM/yyyy")}`}
                </p>
                {c.salaire && (
                  <p className="text-sm text-muted-foreground">
                    Salaire : {c.salaire.toLocaleString("fr-FR")} €
                  </p>
                )}
                {c.notes && <p className="text-sm mt-1">{c.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)}>
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
