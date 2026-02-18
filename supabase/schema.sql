-- Claw HRM SFP - Schéma Supabase

-- Enable RLS
alter table if exists companies enable row level security;
alter table if exists employees enable row level security;
alter table if exists leaves enable row level security;
alter table if exists sick_leaves enable row level security;
alter table if exists employee_documents enable row level security;
alter table if exists pdf_templates enable row level security;
alter table if exists generated_pdfs enable row level security;

-- Companies table
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  siret text,
  address text,
  zip_code text,
  city text,
  country text default 'France',
  phone text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Employees table
create table if not exists employees (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  zip_code text,
  city text,
  birth_date date,
  hire_date date not null,
  position text not null,
  department text,
  salary numeric,
  status text default 'active' check (status in ('active', 'inactive', 'terminated')),
  contract_type text check (contract_type in ('cdi', 'cdd', 'stage', 'freelance', 'other')),
  social_security_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leaves table
create table if not exists leaves (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) on delete cascade not null,
  type text not null check (type in ('paid', 'unpaid', 'sick', 'maternity', 'paternity', 'other')),
  start_date date not null,
  end_date date not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sick leaves table (arrêts maladie)
create table if not exists sick_leaves (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  certificate_url text,
  reason text,
  status text default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Employee documents table
create table if not exists employee_documents (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id) on delete cascade not null,
  name text not null,
  file_url text not null,
  file_type text,
  created_at timestamptz default now()
);

-- PDF Templates table
create table if not exists pdf_templates (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  content text not null,
  variables_schema jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generated PDFs table
create table if not exists generated_pdfs (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references pdf_templates(id) on delete cascade not null,
  employee_id uuid references employees(id) on delete cascade not null,
  data jsonb not null default '{}',
  pdf_url text not null,
  generated_at timestamptz default now()
);

-- RLS Policies (simplified - authenticated users can do everything for now)
create policy "Enable all operations for authenticated users" on companies
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on employees
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on leaves
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on sick_leaves
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on employee_documents
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on pdf_templates
  for all to authenticated using (true) with check (true);

create policy "Enable all operations for authenticated users" on generated_pdfs
  for all to authenticated using (true) with check (true);

-- Storage buckets
delete from storage.buckets where id in ('employee-documents', 'generated-pdfs');
insert into storage.buckets (id, name, public) values 
  ('employee-documents', 'employee-documents', false),
  ('generated-pdfs', 'generated-pdfs', false);

-- Storage policies
create policy "Enable all operations for authenticated users" on storage.objects
  for all to authenticated using (bucket_id in ('employee-documents', 'generated-pdfs'))
  with check (bucket_id in ('employee-documents', 'generated-pdfs'));

-- Indexes
create index idx_employees_company_id on employees(company_id);
create index idx_leaves_employee_id on leaves(employee_id);
create index idx_sick_leaves_employee_id on sick_leaves(employee_id);
create index idx_documents_employee_id on employee_documents(employee_id);
create index idx_templates_company_id on pdf_templates(company_id);
create index idx_generated_pdfs_template_id on generated_pdfs(template_id);
create index idx_generated_pdfs_employee_id on generated_pdfs(employee_id);
