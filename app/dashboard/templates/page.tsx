"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCompanies, usePdfTemplates, useCreatePdfTemplate, useDeletePdfTemplate } from "@/hooks/use-hrm";
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
import { toast } from "sonner";
import { FileText, Plus, Trash2, Eye, FileDown, Building2 } from "lucide-react";
import Link from "next/link";

const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .company { margin-bottom: 20px; }
    .content { line-height: 1.6; }
    .signature { margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{company.name}}</h1>
    <p>{{company.address}}</p>
  </div>
  
  <div class="content">
    <p>Je soussigné(e) {{employee.first_name}} {{employee.last_name}},</p>
    <p>Certifie ...</p>
  </div>
  
  <div class="signature">
    <p>Fait à {{company.city}}, le {{current_date}}</p>
    <p>Signature :</p>
  </div>
</body>
</html>`;

const availableVariables = [
  { key: "{{employee.first_name}}", desc: "Prénom de l'employé" },
  { key: "{{employee.last_name}}", desc: "Nom de l'employé" },
  { key: "{{employee.email}}", desc: "Email" },
  { key: "{{employee.phone}}", desc: "Téléphone" },
  { key: "{{employee.position}}", desc: "Poste" },
  { key: "{{employee.department}}", desc: "Département" },
  { key: "{{employee.hire_date}}", desc: "Date d'embauche" },
  { key: "{{employee.contract_type}}", desc: "Type de contrat" },
  { key: "{{employee.salary}}", desc: "Salaire" },
  { key: "{{company.name}}", desc: "Nom de l'entreprise" },
  { key: "{{company.siret}}", desc: "SIRET" },
  { key: "{{company.address}}", desc: "Adresse" },
  { key: "{{company.city}}", desc: "Ville" },
  { key: "{{current_date}}", desc: "Date du jour" },
];

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const initialCompanyId = searchParams.get("company") || "";
  const { data: companies } = useCompanies();
  const { data: templates } = usePdfTemplates(initialCompanyId || undefined);
  const createTemplate = useCreatePdfTemplate();
  const deleteTemplate = useDeletePdfTemplate();
  const [selectedCompany, setSelectedCompany] = useState(initialCompanyId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    content: defaultTemplate,
    company_id: initialCompanyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_id) {
      toast.error("Veuillez sélectionner une entreprise");
      return;
    }
    try {
      await createTemplate.mutateAsync({
        ...formData,
        variables_schema: {},
      });
      toast.success("Template créé avec succès");
      setOpen(false);
      setFormData({ name: "", content: defaultTemplate, company_id: formData.company_id });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le template "${name}" ?`)) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success("Template supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredTemplates = selectedCompany
    ? templates?.filter((t) => t.company_id === selectedCompany)
    : templates;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Link>
            <h1 className="text-xl font-bold">Templates PDF</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouveau template PDF</DialogTitle>
                <DialogDescription>
                  Créez un template avec des variables dynamiques
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Entreprise *</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du template *</Label>
                  <Input
                    id="name"
                    placeholder="Attestation de travail, Certificat..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Contenu HTML</Label>
                    <textarea
                      className="w-full h-64 p-3 font-mono text-sm border rounded-md"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variables disponibles</Label>
                    <div className="h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                      {availableVariables.map((v) => (
                        <div
                          key={v.key}
                          className="text-xs p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setFormData({ ...formData, content: formData.content + v.key });
                          }}
                        >
                          <code className="text-primary">{v.key}</code>
                          <p className="text-muted-foreground mt-1">{v.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Toutes les entreprises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les entreprises</SelectItem>
              {companies?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTemplates?.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun template</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates?.map((template) => (
              <div
                key={template.id}
                className="p-6 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.company?.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Link href={`/dashboard/templates/${template.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                  <Link href={`/dashboard/templates/${template.id}/generate`}>
                    <Button size="sm">
                      <FileDown className="w-4 h-4 mr-2" />
                      Générer
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
