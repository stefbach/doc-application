-- Migration pour le système de listes de patients
-- À exécuter dans Supabase SQL Editor

-- Table pour les listes personnalisées
CREATE TABLE IF NOT EXISTS patient_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les assignations de patients aux listes
CREATE TABLE IF NOT EXISTS list_patient_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES patient_lists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, patient_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_patient_lists_user_id ON patient_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_patient_assignments_list_id ON list_patient_assignments(list_id);
CREATE INDEX IF NOT EXISTS idx_list_patient_assignments_patient_id ON list_patient_assignments(patient_id);

-- RLS (Row Level Security) pour patient_lists
ALTER TABLE patient_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lists"
  ON patient_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
  ON patient_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON patient_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON patient_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS pour list_patient_assignments
ALTER TABLE list_patient_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments for their lists"
  ON list_patient_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_lists
      WHERE patient_lists.id = list_patient_assignments.list_id
      AND patient_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assignments for their lists"
  ON list_patient_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_lists
      WHERE patient_lists.id = list_patient_assignments.list_id
      AND patient_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assignments from their lists"
  ON list_patient_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_lists
      WHERE patient_lists.id = list_patient_assignments.list_id
      AND patient_lists.user_id = auth.uid()
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_patient_lists_updated_at
  BEFORE UPDATE ON patient_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE patient_lists IS 'Listes personnalisées de patients créées par les utilisateurs';
COMMENT ON TABLE list_patient_assignments IS 'Assignations de patients aux listes personnalisées';
COMMENT ON COLUMN patient_lists.color IS 'Couleur de la liste au format hexadécimal (ex: #3b82f6)';
COMMENT ON COLUMN patient_lists.icon IS 'Nom de l icône Lucide React (optionnel)';
