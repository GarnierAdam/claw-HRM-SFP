-- Migration: Add 5 new employee detail tables
-- Tables: medical_visits, mutuelles, formations, equipment_handovers, contracts

-- 1. Medical Visits (CIST)
CREATE TABLE medical_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date_visite DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('embauche', 'periodique', 'reprise')),
  medecin TEXT,
  resultat TEXT CHECK (resultat IN ('apte', 'inapte', 'restrictions')),
  prochaine_visite DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_medical_visits_employee ON medical_visits(employee_id);
ALTER TABLE medical_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage medical_visits" ON medical_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Mutuelles
CREATE TABLE mutuelles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organisme TEXT NOT NULL,
  formule TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE,
  niveau_couverture TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mutuelles_employee ON mutuelles(employee_id);
ALTER TABLE mutuelles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage mutuelles" ON mutuelles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Formations
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  intitule TEXT NOT NULL,
  organisme TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut TEXT NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'en_cours', 'terminee')),
  certificat_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formations_employee ON formations(employee_id);
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage formations" ON formations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Equipment Handovers (Remise Matériel)
CREATE TABLE equipment_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  numero_serie TEXT,
  date_remise DATE NOT NULL,
  date_retour DATE,
  etat TEXT NOT NULL DEFAULT 'neuf' CHECK (etat IN ('neuf', 'bon', 'use', 'endommage')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_equipment_handovers_employee ON equipment_handovers(employee_id);
ALTER TABLE equipment_handovers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage equipment_handovers" ON equipment_handovers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Contracts
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cdi', 'cdd', 'stage', 'freelance', 'autre')),
  date_debut DATE NOT NULL,
  date_fin DATE,
  salaire NUMERIC,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contracts_employee ON contracts(employee_id);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage contracts" ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
