"use client";

import { useState } from "react";
import { useCompanies, useCreateCompany, useDeleteCompany } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CompaniesPage() {
  const { data: companies, isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    siret: "",
    address: "",
    city: "",
    zip_code: "",
    country: "France",
    phone: "",
    email: "",
    logo_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany.mutateAsync(formData);
      toast.success("Entreprise créée avec succès");
      setOpen(false);
      setFormData({
        name: "",
        siret: "",
        address: "",
        city: "",
        zip_code: "",
        country: "France",
        phone: "",
        email: "",
        logo_url: "",
      });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'entreprise "${name}" ?`)) return;
    try {
      await deleteCompany.mutateAsync(id);
      toast.success("Entreprise supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Entreprises</h1>
          <p className="text-muted-foreground">
            Gérez vos entreprises et leurs employés
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle entreprise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouvelle entreprise</DialogTitle>
              <DialogDescription>
                Ajoutez les informations de l'entreprise
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={formData.siret}
                      onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Logo (URL)</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">Code postal</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
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
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCompany.isPending}>
                    {createCompany.isPending ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : companies?.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune entreprise</p>
            <p className="text-sm text-muted-foreground">
              Créez votre première entreprise pour commencer
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies?.map((company) => (
              <div
                key={company.id}
                className="p-6 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      {company.siret && (
                        <p className="text-sm text-muted-foreground">SIRET: {company.siret}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(company.id, company.name)}
                    disabled={deleteCompany.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                {(company.address || company.city) && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {company.address}
                    {company.address && company.city && ", "}
                    {company.city} {company.zip_code}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Link href={`/dashboard/companies/${company.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
