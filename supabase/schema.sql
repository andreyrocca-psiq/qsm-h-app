-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create doctor_patient relationship table
CREATE TABLE doctor_patient (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(doctor_id, patient_id),
  CHECK (doctor_id != patient_id)
);

-- Create questionnaires table (stores completed questionnaires)
CREATE TABLE questionnaires (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- PHQ-9 Scores (Depressive symptoms)
  dep1 INTEGER NOT NULL CHECK (dep1 BETWEEN 0 AND 3),
  dep2 INTEGER NOT NULL CHECK (dep2 BETWEEN 0 AND 3),
  dep3 INTEGER NOT NULL CHECK (dep3 BETWEEN 0 AND 3),
  dep4 INTEGER NOT NULL CHECK (dep4 BETWEEN 0 AND 3),
  dep5 INTEGER NOT NULL CHECK (dep5 BETWEEN 0 AND 3),
  dep6 INTEGER NOT NULL CHECK (dep6 BETWEEN 0 AND 3),
  dep7 INTEGER NOT NULL CHECK (dep7 BETWEEN 0 AND 3),
  dep8 INTEGER NOT NULL CHECK (dep8 BETWEEN 0 AND 3),
  dep9 INTEGER NOT NULL CHECK (dep9 BETWEEN 0 AND 3),
  dep_total INTEGER GENERATED ALWAYS AS (dep1 + dep2 + dep3 + dep4 + dep5 + dep6 + dep7 + dep8 + dep9) STORED,

  -- PMQ-9 Scores (Activation symptoms)
  act1 INTEGER NOT NULL CHECK (act1 BETWEEN 0 AND 3),
  act2 INTEGER NOT NULL CHECK (act2 BETWEEN 0 AND 3),
  act3 INTEGER NOT NULL CHECK (act3 BETWEEN 0 AND 3),
  act4 INTEGER NOT NULL CHECK (act4 BETWEEN 0 AND 3),
  act5 INTEGER NOT NULL CHECK (act5 BETWEEN 0 AND 3),
  act6 INTEGER NOT NULL CHECK (act6 BETWEEN 0 AND 3),
  act7 INTEGER NOT NULL CHECK (act7 BETWEEN 0 AND 3),
  act8 INTEGER NOT NULL CHECK (act8 BETWEEN 0 AND 3),
  act9 INTEGER NOT NULL CHECK (act9 BETWEEN 0 AND 3),
  act_total INTEGER GENERATED ALWAYS AS (act1 + act2 + act3 + act4 + act5 + act6 + act7 + act8 + act9) STORED,

  -- Combined score
  combined_total INTEGER GENERATED ALWAYS AS (dep1 + dep2 + dep3 + dep4 + dep5 + dep6 + dep7 + dep8 + dep9 + act1 + act2 + act3 + act4 + act5 + act6 + act7 + act8 + act9) STORED,

  -- Habit questions
  sleep_hours TEXT NOT NULL,
  sleep_quality TEXT NOT NULL,
  sleep_routine TEXT NOT NULL,
  medication TEXT NOT NULL,
  exercise TEXT NOT NULL,
  alcohol TEXT NOT NULL,
  drugs TEXT NOT NULL
);

-- Create notifications table (for push notification tracking)
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create push subscriptions table (for web push notifications)
CREATE TABLE push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for doctor_patient
CREATE POLICY "Doctors can view their patients"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their doctors"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can invite patients"
  ON doctor_patient FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
  );

-- RLS Policies for questionnaires
CREATE POLICY "Patients can view their own questionnaires"
  ON questionnaires FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own questionnaires"
  ON questionnaires FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their patients' questionnaires"
  ON questionnaires FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_patient
      WHERE doctor_patient.doctor_id = auth.uid()
      AND doctor_patient.patient_id = questionnaires.patient_id
      AND doctor_patient.accepted_at IS NOT NULL
    )
  );

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_questionnaires_patient_id ON questionnaires(patient_id);
CREATE INDEX idx_questionnaires_completed_at ON questionnaires(completed_at DESC);
CREATE INDEX idx_doctor_patient_doctor_id ON doctor_patient(doctor_id);
CREATE INDEX idx_doctor_patient_patient_id ON doctor_patient(patient_id);
CREATE INDEX idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
