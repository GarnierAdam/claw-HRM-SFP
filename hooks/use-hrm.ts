import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import type { Company, Employee, Leave, SickLeave, PdfTemplate } from "@/types";

const supabase = createClient();

// Companies
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Company;
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("companies").insert(company).select().single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Company> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from("companies")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Company;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

// Employees
export function useEmployees(companyId?: string) {
  return useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      let query = supabase.from("employees").select("*, company:companies(*)");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query.order("last_name");
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*, company:companies(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<Employee, "id" | "created_at" | "updated_at" | "company">) => {
      const { data, error } = await supabase.from("employees").insert(employee).select().single();
      if (error) throw error;
      return data as Employee;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees", variables.company_id] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Employee> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from("employees")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// Sick Leaves
export function useSickLeaves(employeeId?: string) {
  return useQuery({
    queryKey: ["sick-leaves", employeeId],
    queryFn: async () => {
      let query = supabase.from("sick_leaves").select("*, employee:employees(*, company:companies(*))");
      if (employeeId) query = query.eq("employee_id", employeeId);
      const { data, error } = await query.order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSickLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leave: { employee_id: string; start_date: string; end_date: string; reason?: string; certificate_url?: string }) => {
      const { data, error } = await supabase.from("sick_leaves").insert(leave).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sick-leaves"] });
    },
  });
}

// PDF Templates
export function usePdfTemplates(companyId?: string) {
  return useQuery({
    queryKey: ["pdf-templates", companyId],
    queryFn: async () => {
      let query = supabase.from("pdf_templates").select("*, company:companies(*)");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query.order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePdfTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: { company_id: string; name: string; content: string; variables_schema?: Record<string, string> }) => {
      const { data, error } = await supabase.from("pdf_templates").insert(template).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-templates"] });
    },
  });
}

export function useDeletePdfTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pdf_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-templates"] });
    },
  });
}

// Leaves
export function useLeaves(employeeId?: string) {
  return useQuery({
    queryKey: ["leaves", employeeId],
    queryFn: async () => {
      let query = supabase.from("leaves").select("*, employee:employees(*, company:companies(*))");
      if (employeeId) query = query.eq("employee_id", employeeId);
      const { data, error } = await query.order("start_date", { ascending: false });
      if (error) throw error;
      return data as Leave[];
    },
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leave: Omit<Leave, "id" | "created_at" | "updated_at" | "employee">) => {
      const { data, error } = await supabase.from("leaves").insert(leave).select().single();
      if (error) throw error;
      return data as Leave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Leave> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from("leaves")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated as Leave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

// File Upload
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      return response.json() as Promise<{ url: string; filename: string }>;
    },
  });
}
