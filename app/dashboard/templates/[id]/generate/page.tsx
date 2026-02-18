"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { usePdfTemplates, useCompanies, useEmployees } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileDown, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase-client";

export default function GeneratePdfPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { data: templates } = usePdfTemplates();
  const { data: companies } = useCompanies();
  const { data: employees } = useEmployees();
  const supabase = createClient();
  
  const template = templates?.find((t) => t.id === templateId);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [generating, setGenerating] = useState(false);

  const employee = employees?.find((e) => e.id === selectedEmployee);
  const company = companies?.find((c) => c.id === template?.company_id);

  useEffect(() => {
    if (template && employee && company) {
      let html = template.content;
      
      // Remplacer les variables
      html = html.replace(/{{employee\.first_name}}/g, employee.first_name);
      html = html.replace(/{{employee\.last_name}}/g, employee.last_name);
      html = html.replace(/{{employee\.email}}/g, employee.email || "");
      html = html.replace(/{{employee\.phone}}/g, employee.phone || "");
      html = html.replace(/{{employee\.position}}/g, employee.position);
      html = html.replace(/{{employee\.department}}/g, employee.department || "");
      html = html.replace(/{{employee\.hire_date}}/g, 
        employee.hire_date ? format(new Date(employee.hire_date), "dd/MM/yyyy") : ""
      );
      html = html.replace(/{{employee\.contract_type}}/g, employee.contract_type?.toUpperCase() || "");
      html = html.replace(/{{employee\.salary}}/g, employee.salary?.toString() || "");
      
      html = html.replace(/{{company\.name}}/g, company.name);
      html = html.replace(/{{company\.siret}}/g, company.siret || "");
      html = html.replace(/{{company\.address}}/g, company.address || "");
      html = html.replace(/{{company\.city}}/g, company.city || "");
      
      html = html.replace(/{{current_date}}/g, format(new Date(), "dd MMMM yyyy", { locale: fr }));
      
      setPreviewHtml(html);
    } else if (template) {
      setPreviewHtml(template.content);
    }
  }, [template, employee, company]);

  const handleDownload = async () => {
    if (!employee) {
      toast.error("Veuillez sélectionner un employé");
      return;
    }
    
    setGenerating(true);
    try {
      // Ouvrir dans une nouvelle fenêtre pour impression PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(previewHtml);
        printWindow.document.close();
        printWindow.print();
        
        // Sauvegarder dans l'historique
        const { error } = await supabase.from("generated_pdfs").insert({
          template_id: templateId,
          employee_id: selectedEmployee,
          data: {
            employee_name: `${employee.first_name} ${employee.last_name}`,
            generated_at: new Date().toISOString(),
          },
          pdf_url: "printed", // On pourrait générer un vrai PDF et l'uploader
        });
        
        if (error) console.error(error);
        
        toast.success("Document prêt pour impression / sauvegarde PDF");
      }
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  if (!template) return <p className="p-8">Template non trouvé</p>;

  const templateEmployees = employees?.filter((e) => e.company_id === template.company_id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/templates" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold">Générer: {template.name}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="font-semibold mb-4">Paramètres</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employé</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateEmployees?.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.first_name} {e.last_name} - {e.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleDownload}
                  disabled={!selectedEmployee || generating}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {generating ? "Génération..." : "Ouvrir pour impression PDF"}
                </Button>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sélectionnez un employé</li>
                <li>• Le document s'ouvre dans une nouvelle fenêtre</li>
                <li>• Utilisez Ctrl+P / Cmd+P pour sauvegarder en PDF</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-muted flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Aperçu</span>
              </div>
              <div className="p-8 min-h-[600px]">
                {previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Sélectionnez un employé pour voir l'aperçu
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
