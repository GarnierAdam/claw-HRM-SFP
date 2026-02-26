"use client";

import { useContracts, useCreateContract, useUpdateContract, useDeleteContract, useEmployees } from "@/hooks/use-hrm";
import type { Contract } from "@/types";
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

const contractTypes = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
  autre: "Autre",
};

const emptyForm = {
  employee_id: "",
  type: "cdi" as const,
  date_debut: "",
  date_fin: "",
  salaire: "",
  document_url: "",
  notes: "",
};

export default function ContratsPage() {
  const { data: contracts } = useContracts();
  const { data: employees } = useEmployees();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isActive = (c: Contract) => !c.date_fin || new Date(c.date_fin) >= new Date();

  const resetAndClose = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (contract: Contract) => {
    setForm({
      employee_id: contract.employee_id,
      type: contract.type,
      date_debut: contract.date_debut,
      date_fin: contract.date_fin || "",
      salaire: contract.salaire?.toString() || "",
      document_url: contract.document_url || "",
      notes: contract.notes || "",
    });
    setEditingId(contract.id);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      salaire: form.salaire ? parseFloat(form.salaire) : undefined,
    };
    try {
      if (editingId) {
        await updateContract.mutateAsync({ id: editingId, ...payload });
        toast.success("Contrat modifié");
      } else {
        await createContract.mutateAsync(payload);
        toast.success("Contrat créé");
      }
      resetAndClose();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContract.mutateAsync(id);
      toast.success("Contrat supprimé");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contrats</h1>
            <p className="text-muted-foreground">Gestion globale des contrats</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un contrat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier le contrat" : "Nouveau contrat"}</DialogTitle>
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
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">Total contrats</h3>
            <p className="text-3xl font-bold">{contracts?.length || 0}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">En cours</h3>
            <p className="text-3xl font-bold text-green-600">
              {contracts?.filter(isActive).length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">CDI</h3>
            <p className="text-3xl font-bold text-blue-600">
              {contracts?.filter(c => c.type === 'cdi').length || 0}
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-muted-foreground text-sm mb-2">CDD</h3>
            <p className="text-3xl font-bold text-purple-600">
              {contracts?.filter(c => c.type === 'cdd').length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {contracts?.map((contract: Contract) => (
          <div key={contract.id} className="p-4 bg-card rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{contractTypes[contract.type]}</h3>
                  <Badge variant={isActive(contract) ? "default" : "secondary"}>
                    {isActive(contract) ? "En cours" : "Terminé"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Date début:</span>{" "}
                      {format(new Date(contract.date_debut), "dd MMMM yyyy", { locale: fr })}
                    </p>
                    {contract.date_fin && (
                      <p>
                        <span className="font-medium">Date fin:</span>{" "}
                        {format(new Date(contract.date_fin), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Employé:</span>
                      {employees?.find(emp => emp.id === contract.employee_id) ? (
                        <Link href={`/dashboard/employees/${contract.employee_id}`} className="text-primary hover:underline ml-1">
                          {employees.find(emp => emp.id === contract.employee_id)?.last_name} {employees.find(emp => emp.id === contract.employee_id)?.first_name}
                        </Link>
                      ) : (
                        <span className="ml-1 text-muted-foreground">Employé inconnu</span>
                      )}
                    </p>
                    {contract.salaire && (
                      <p>
                        <span className="font-medium">Salaire:</span>{" "}
                        {contract.salaire.toLocaleString("fr-FR")} €
                      </p>
                    )}
                  </div>
                </div>
                {contract.notes && <p className="text-sm mt-2">{contract.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(contract)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(contract.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!contracts?.length && (
          <p className="text-muted-foreground text-center py-8">Aucun contrat enregistré</p>
        )}
      </div>
    </div>
  );
}
