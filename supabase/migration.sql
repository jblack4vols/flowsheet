-- ============================================================
-- Tristar PT Flowsheets — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Therapist' CHECK (role IN ('Admin', 'Therapist', 'Front Desk')),
  clinic TEXT NOT NULL DEFAULT 'Morristown',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, clinic)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'Therapist',
    'Morristown'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 2. CLINICS (reference table)
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view clinics" ON clinics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage clinics" ON clinics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
  );

INSERT INTO clinics (name) VALUES
  ('Morristown'), ('Bean Station'), ('New Tazewell'), ('Maryville'),
  ('Newport'), ('Rogersville'), ('Jefferson City'), ('Johnson City')
ON CONFLICT (name) DO NOTHING;


-- 3. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE,
  clinic TEXT NOT NULL,
  therapist TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'DC')),
  diagnosis TEXT,
  referring_physician TEXT,
  insurance TEXT,
  last_visit DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);


-- 4. VISITS
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  therapist TEXT,
  bp TEXT,
  hr INTEGER,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  exercises JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view visits" ON visits
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert visits" ON visits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);


-- 5. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Authenticated users can insert audit entries" ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);


-- 6. SEED DATA (sample patients)
INSERT INTO patients (first_name, last_name, dob, clinic, therapist, status, diagnosis, referring_physician, insurance, last_visit) VALUES
  ('John', 'Smith', '1965-03-15', 'Morristown', 'Dr. Carter', 'Active', 'ACL Reconstruction', 'Dr. Johnson', 'Blue Cross', '2026-02-20'),
  ('Sarah', 'Jones', '1978-11-02', 'Morristown', 'Dr. Carter', 'Active', 'Cervical Radiculopathy', 'Dr. Adams', 'Aetna', '2026-02-22'),
  ('James', 'Taylor', '1952-06-30', 'Morristown', 'Dr. Carter', 'DC', 'Total Hip Replacement', 'Dr. Johnson', 'Medicare', '2026-01-10'),
  ('Mary', 'Johnson', '1972-07-22', 'Bean Station', 'Dr. Reeves', 'Active', 'Shoulder Impingement', 'Dr. Williams', 'Aetna', '2026-02-18'),
  ('William', 'Clark', '1985-04-17', 'Bean Station', 'Dr. Reeves', 'Active', 'Plantar Fasciitis', 'Dr. Evans', 'Cigna', '2026-02-21'),
  ('Linda', 'Harris', '1960-09-11', 'Bean Station', 'Dr. Reeves', 'Inactive', 'Frozen Shoulder', 'Dr. Williams', 'Medicare', '2026-01-28'),
  ('Robert', 'Williams', '1958-11-08', 'New Tazewell', 'Dr. Nguyen', 'Inactive', 'Knee OA', 'Dr. Brown', 'Medicare', '2026-01-15'),
  ('Karen', 'Martinez', '1990-02-14', 'New Tazewell', 'Dr. Nguyen', 'Active', 'Lumbar Disc Herniation', 'Dr. Brown', 'Blue Cross', '2026-02-23'),
  ('Thomas', 'Anderson', '1967-08-25', 'New Tazewell', 'Dr. Nguyen', 'DC', 'Carpal Tunnel Syndrome', 'Dr. Lee', 'Humana', '2025-12-20'),
  ('Patricia', 'Brown', '1980-05-30', 'Maryville', 'Dr. Patel', 'Active', 'Rotator Cuff Tear', 'Dr. Davis', 'Cigna', '2026-02-22'),
  ('Charles', 'White', '1955-12-05', 'Maryville', 'Dr. Patel', 'Active', 'Total Knee Replacement', 'Dr. Davis', 'Medicare', '2026-02-24'),
  ('Nancy', 'Thompson', '1973-03-19', 'Maryville', 'Dr. Patel', 'Inactive', 'Tennis Elbow', 'Dr. Hall', 'United', '2026-02-01'),
  ('Michael', 'Davis', '1995-01-14', 'Newport', 'Dr. Kim', 'DC', 'Ankle Sprain', 'Dr. Miller', 'Humana', '2026-02-10'),
  ('Betty', 'Garcia', '1948-07-08', 'Newport', 'Dr. Kim', 'Active', 'Spinal Stenosis', 'Dr. Miller', 'Medicare', '2026-02-19'),
  ('Daniel', 'Robinson', '1982-10-22', 'Newport', 'Dr. Kim', 'Active', 'Achilles Tendinitis', 'Dr. Young', 'Blue Cross', '2026-02-23'),
  ('Susan', 'Miller', '1962-09-25', 'Rogersville', 'Dr. Hayes', 'Active', 'Hip Flexor Strain', 'Dr. Wilson', 'United', '2026-02-21'),
  ('Mark', 'Lewis', '1970-01-30', 'Rogersville', 'Dr. Hayes', 'DC', 'Wrist Fracture Rehab', 'Dr. Wilson', 'Aetna', '2026-01-05'),
  ('Lisa', 'Walker', '1988-05-12', 'Rogersville', 'Dr. Hayes', 'Active', 'Patellofemoral Syndrome', 'Dr. King', 'Cigna', '2026-02-24'),
  ('David', 'Wilson', '1975-12-03', 'Jefferson City', 'Dr. Brooks', 'Active', 'Lower Back Pain', 'Dr. Moore', 'Blue Cross', '2026-02-19'),
  ('Margaret', 'Hall', '1963-04-28', 'Jefferson City', 'Dr. Brooks', 'Active', 'Neck Pain', 'Dr. Moore', 'Aetna', '2026-02-20'),
  ('Steven', 'Allen', '1987-09-15', 'Jefferson City', 'Dr. Brooks', 'Inactive', 'IT Band Syndrome', 'Dr. Moore', 'Cigna', '2026-02-05'),
  ('Dorothy', 'Young', '1950-02-18', 'Johnson City', 'Dr. Foster', 'Active', 'Osteoporosis Rehab', 'Dr. Clark', 'Medicare', '2026-02-22'),
  ('Richard', 'King', '1983-06-09', 'Johnson City', 'Dr. Foster', 'Active', 'Meniscus Tear', 'Dr. Clark', 'Blue Cross', '2026-02-24'),
  ('Barbara', 'Scott', '1968-10-31', 'Johnson City', 'Dr. Foster', 'DC', 'Post-Surgical Shoulder', 'Dr. Clark', 'Humana', '2026-01-18')
ON CONFLICT DO NOTHING;


-- 7. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
