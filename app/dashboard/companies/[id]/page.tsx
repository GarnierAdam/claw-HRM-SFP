"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCompany, useEmployees, useCreateEmployee, useDeleteEmployee } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Trash2, Building2, Mail, Phone, FileText } from "lucide-react";
import Link from "next/link";

const contractTypes = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
  other: "Autre",
};

const employeeStatuses = {
  active: { label: "Actif", variant: "default" as const },
  inactive: { label: "Inactif", variant: "secondary" as const },
  terminated: { label: "Terminé", variant: "destructive" as const },
};

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: employees, isLoading: employeesLoading } = useEmployees(companyId);
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: new Date().toISOString().split("T")[0],
    contract_type: "cdi" as const,
    salary: "",
    status: "active" as const,
    company_id: companyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      });
      toast.success("Employé créé avec succès");
      setOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        hire_date: new Date().toISOString().split("T")[0],
        contract_type: "cdi",
        salary: "",
        status: "active",
        company_id: companyId,
      });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'employé "${name}" ?`)) return;
    try {
      await deleteEmployee.mutateAsync(id);
      toast.success("Employé supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (companyLoading) {
    return <p className="p-8">Chargement...</p>;
  }

  if (!company) {
    return <p className="p-8">Entreprise non trouvée</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/companies" className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.siret && <p className="text-muted-foreground">SIRET: {company.siret}</p>}
              </div>
            </div>
            <Link href={`/dashboard/templates?company=${companyId}`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Templates PDF
              </Button>
            </Link>
          </div>
          {(company.address || company.city) && (
            <p className="text-muted-foreground mt-2">
              {company.address} {company.city && `- ${company.city} ${company.zip_code}`}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Employés ({employees?.length || 0})</h2>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel employé
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvel employé</DialogTitle>
                <DialogDescription>Ajoutez un nouvel employé à {company.name}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Poste *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Date d'embauche *</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salaire annuel brut (€)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Type de contrat</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) => setFormData({ ...formData, contract_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(contractTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {employeesLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : employees?.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun employé</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {employees?.map((employee) => (
              <div
                key={employee.id}
                className="p-4 bg-card rounded-lg border flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {employee.first_name[0]}{employee.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                      <Badge variant={employeeStatuses[employee.status].variant}>
                        {employeeStatuses[employee.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {employee.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {employee.email}
                        </span>
                      )}
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {employee.phone}
                        </span>
                      )}
                      {employee.contract_type && (
                        <span>{contractTypes[employee.contract_type]}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/employees/${employee.id}`}>
                    <Button variant="outline" size="sm">Voir</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id, `${employee.first_name} ${employee.last_name}`)}
                    disabled={deleteEmployee.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
