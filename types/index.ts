export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  siret?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  birth_date?: string;
  hire_date: string;
  position: string;
  department?: string;
  salary?: number;
  status: "active" | "inactive" | "terminated";
  contract_type?: "cdi" | "cdd" | "stage" | "freelance" | "other";
  social_security_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Leave {
  id: string;
  employee_id: string;
  type: "paid" | "unpaid" | "sick" | "maternity" | "paternity" | "other";
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface SickLeave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  certificate_url?: string;
  reason?: string;
  status: "pending" | "approved";
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface PdfTemplate {
  id: string;
  company_id: string;
  name: string;
  content: string;
  variables_schema: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface GeneratedPdf {
  id: string;
  template_id: string;
  employee_id: string;
  data: Record<string, unknown>;
  pdf_url: string;
  generated_at: string;
  template?: PdfTemplate;
  employee?: Employee;
}

export interface MedicalVisit {
  id: string;
  employee_id: string;
  date_visite: string;
  type: "embauche" | "periodique" | "reprise";
  medecin?: string;
  resultat?: "apte" | "inapte" | "restrictions";
  prochaine_visite?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Mutuelle {
  id: string;
  employee_id: string;
  organisme: string;
  formule?: string;
  date_debut: string;
  date_fin?: string;
  niveau_couverture?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Formation {
  id: string;
  employee_id: string;
  intitule: string;
  organisme?: string;
  date_debut: string;
  date_fin?: string;
  statut: "planifiee" | "en_cours" | "terminee";
  certificat_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentHandover {
  id: string;
  employee_id: string;
  designation: string;
  numero_serie?: string;
  date_remise: string;
  date_retour?: string;
  etat: "neuf" | "bon" | "use" | "endommage";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  employee_id: string;
  type: "cdi" | "cdd" | "stage" | "freelance" | "autre";
  date_debut: string;
  date_fin?: string;
  salaire?: number;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LeaveType = Leave["type"];
export type LeaveStatus = Leave["status"];
export type EmployeeStatus = Employee["status"];
export type ContractType = Employee["contract_type"];
