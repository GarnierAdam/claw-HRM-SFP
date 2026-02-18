"use client";

import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/use-hrm";
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
import { FileText, Upload, Trash2, Plus, Download } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function EmployeeDocumentsPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const queryClient = useQueryClient();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["employee-documents", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${employeeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("employee_documents").insert({
        employee_id: employeeId,
        name: documentName || file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
      });

      if (dbError) throw dbError;

      toast.success("Document uploadé avec succès");
      setOpen(false);
      setDocumentName("");
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
    } catch (error) {
      toast.error("Erreur lors de l'upload");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le document "${name}" ?`)) return;
    try {
      const { error } = await supabase.from("employee_documents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Document supprimé");
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (employeeLoading) return <p className="p-8">Chargement...</p>;
  if (!employee) return <p className="p-8">Employé non trouvé</p>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/employees/${employeeId}`} className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Link>
          </div>
          <h1 className="text-2xl font-bold">
            Documents de {employee.first_name} {employee.last_name}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {documents?.length || 0} document{documents?.length !== 1 ? "s" : ""}
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
                <DialogDescription>
                  Téléchargez un contrat, fiche de paie, ou autre document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du document</Label>
                  <Input
                    placeholder="Contrat de travail, Fiche de paie..."
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fichier</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: PDF, Word, images
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                  Annuler
                </Button>
                <Button disabled={uploading}>
                  {uploading ? "Upload..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {documentsLoading ? (
          <p>Chargement...</p>
        ) : documents?.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun document</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez des contrats, fiches de paie, ou certificats
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents?.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-card rounded-lg border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ajouté le {format(new Date(doc.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.name)}
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
