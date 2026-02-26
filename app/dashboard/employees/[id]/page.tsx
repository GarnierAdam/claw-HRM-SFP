"use client";

import { useParams } from "next/navigation";
import { useEmployee, useLeaves, useMedicalVisits, useMutuelles, useFormations, useEquipmentHandovers, useContracts } from "@/hooks/use-hrm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LeavesTab } from "@/components/employee/leaves-tab";
import { CistTab } from "@/components/employee/cist-tab";
import { MutuellesTab } from "@/components/employee/mutuelles-tab";
import { FormationsTab } from "@/components/employee/formations-tab";
import { MaterielTab } from "@/components/employee/materiel-tab";
import { ContratsTab } from "@/components/employee/contrats-tab";

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const { data: employee, isLoading } = useEmployee(employeeId);
  const { data: leaves } = useLeaves(employeeId);
  const { data: medicalVisits } = useMedicalVisits(employeeId);
  const { data: mutuelles } = useMutuelles(employeeId);
  const { data: formations } = useFormations(employeeId);
  const { data: equipmentHandovers } = useEquipmentHandovers(employeeId);
  const { data: contracts } = useContracts(employeeId);

  if (isLoading) return <p className="p-8">Chargement...</p>;
  if (!employee) return <p className="p-8">Employé non trouvé</p>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/companies/${employee.company_id}`} className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {employee.first_name[0]}{employee.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{employee.first_name} {employee.last_name}</h1>
                <p className="text-muted-foreground">{employee.position} {employee.department && `- ${employee.department}`}</p>
                <Badge className="mt-1">{employee.company?.name}</Badge>
              </div>
            </div>
            <Link href={`/dashboard/employees/${employeeId}/documents`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="leaves">Congés ({leaves?.length || 0})</TabsTrigger>
            <TabsTrigger value="cist">CIST ({medicalVisits?.length || 0})</TabsTrigger>
            <TabsTrigger value="mutuelles">Mutuelles ({mutuelles?.length || 0})</TabsTrigger>
            <TabsTrigger value="formations">Formations ({formations?.length || 0})</TabsTrigger>
            <TabsTrigger value="materiel">Matériel ({equipmentHandovers?.length || 0})</TabsTrigger>
            <TabsTrigger value="contrats">Contrats ({contracts?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> Informations personnelles
                </h3>
                <div className="space-y-3 text-sm">
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${employee.email}`} className="text-primary hover:underline">{employee.email}</a>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {employee.phone}
                    </div>
                  )}
                  {(employee.address || employee.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {employee.address}{employee.address && employee.city && ", "}{employee.city} {employee.zip_code}
                    </div>
                  )}
                  {employee.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Né(e) le {format(new Date(employee.birth_date), "dd MMMM yyyy", { locale: fr })}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" /> Informations professionnelles
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Poste:</span> {employee.position}
                  </div>
                  {employee.department && (
                    <div>
                      <span className="text-muted-foreground">Département:</span> {employee.department}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Date d&apos;embauche:</span>{" "}
                    {format(new Date(employee.hire_date), "dd MMMM yyyy", { locale: fr })}
                  </div>
                  {employee.contract_type && (
                    <div>
                      <span className="text-muted-foreground">Contrat:</span>{" "}
                      {employee.contract_type.toUpperCase()}
                    </div>
                  )}
                  {employee.salary && (
                    <div>
                      <span className="text-muted-foreground">Salaire annuel brut:</span>{" "}
                      {employee.salary.toLocaleString("fr-FR")} €
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Statut:</span>{" "}
                    <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                      {employee.status === "active" ? "Actif" : employee.status === "inactive" ? "Inactif" : "Terminé"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {(employee.social_security_number || employee.emergency_contact_name) && (
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-4">Informations complémentaires</h3>
                <div className="space-y-2 text-sm">
                  {employee.social_security_number && (
                    <div><span className="text-muted-foreground">Numéro de sécurité sociale:</span> {employee.social_security_number}</div>
                  )}
                  {employee.emergency_contact_name && (
                    <div>
                      <span className="text-muted-foreground">Contact d&apos;urgence:</span>{" "}
                      {employee.emergency_contact_name} {employee.emergency_contact_phone && `(${employee.emergency_contact_phone})`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {employee.notes && (
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaves">
            <LeavesTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="cist">
            <CistTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="mutuelles">
            <MutuellesTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="formations">
            <FormationsTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="materiel">
            <MaterielTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="contrats">
            <ContratsTab employeeId={employeeId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
