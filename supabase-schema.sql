-- QSM-H Database Schema for Supabase
-- Execute este script no SQL Editor do Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Doctors can view patient profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'doctor'
        )
    );

-- Doctor-Patient Relationships
CREATE TABLE IF NOT EXISTS doctor_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(doctor_id, patient_id)
);

-- Enable RLS on doctor_patients
ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;

-- Policies for doctor_patients
CREATE POLICY "Doctors can manage their relationships"
    ON doctor_patients FOR ALL
    USING (doctor_id = auth.uid());

CREATE POLICY "Patients can view their relationships"
    ON doctor_patients FOR SELECT
    USING (patient_id = auth.uid());

CREATE POLICY "Patients can accept invitations"
    ON doctor_patients FOR UPDATE
    USING (patient_id = auth.uid());

-- Questionnaires Table
CREATE TABLE IF NOT EXISTS questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Depressive symptoms (PHQ-9)
    dep1 INTEGER NOT NULL CHECK (dep1 >= 0 AND dep1 <= 3),
    dep2 INTEGER NOT NULL CHECK (dep2 >= 0 AND dep2 <= 3),
    dep3 INTEGER NOT NULL CHECK (dep3 >= 0 AND dep3 <= 3),
    dep4 INTEGER NOT NULL CHECK (dep4 >= 0 AND dep4 <= 3),
    dep5 INTEGER NOT NULL CHECK (dep5 >= 0 AND dep5 <= 3),
    dep6 INTEGER NOT NULL CHECK (dep6 >= 0 AND dep6 <= 3),
    dep7 INTEGER NOT NULL CHECK (dep7 >= 0 AND dep7 <= 3),
    dep8 INTEGER NOT NULL CHECK (dep8 >= 0 AND dep8 <= 3),
    dep9 INTEGER NOT NULL CHECK (dep9 >= 0 AND dep9 <= 3),
    dep_total INTEGER NOT NULL,

    -- Activation symptoms (PMQ-9)
    act1 INTEGER NOT NULL CHECK (act1 >= 0 AND act1 <= 3),
    act2 INTEGER NOT NULL CHECK (act2 >= 0 AND act2 <= 3),
    act3 INTEGER NOT NULL CHECK (act3 >= 0 AND act3 <= 3),
    act4 INTEGER NOT NULL CHECK (act4 >= 0 AND act4 <= 3),
    act5 INTEGER NOT NULL CHECK (act5 >= 0 AND act5 <= 3),
    act6 INTEGER NOT NULL CHECK (act6 >= 0 AND act6 <= 3),
    act7 INTEGER NOT NULL CHECK (act7 >= 0 AND act7 <= 3),
    act8 INTEGER NOT NULL CHECK (act8 >= 0 AND act8 <= 3),
    act9 INTEGER NOT NULL CHECK (act9 >= 0 AND act9 <= 3),
    act_total INTEGER NOT NULL,

    combined_total INTEGER NOT NULL,

    -- Habits
    sleep_hours TEXT NOT NULL,
    sleep_quality TEXT NOT NULL,
    sleep_routine TEXT NOT NULL,
    medication TEXT NOT NULL,
    exercise TEXT NOT NULL,
    alcohol TEXT NOT NULL,
    drugs TEXT NOT NULL
);

-- Enable RLS on questionnaires
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaires
CREATE POLICY "Patients can manage own questionnaires"
    ON questionnaires FOR ALL
    USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient questionnaires"
    ON questionnaires FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_patients dp
            WHERE dp.doctor_id = auth.uid()
            AND dp.patient_id = questionnaires.patient_id
            AND dp.accepted_at IS NOT NULL
        )
    );

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Enable RLS on push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for push_subscriptions
CREATE POLICY "Users can manage own subscriptions"
    ON push_subscriptions FOR ALL
    USING (user_id = auth.uid());

-- LGPD Compliance Tables

-- User Consents
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    consent_text TEXT NOT NULL,
    consented BOOLEAN NOT NULL DEFAULT false,
    consented_at TIMESTAMPTZ,
    version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Policies for user_consents
CREATE POLICY "Users can manage own consents"
    ON user_consents FOR ALL
    USING (user_id = auth.uid());

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- Data Deletion Requests
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

-- Enable RLS on data_deletion_requests
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policies for data_deletion_requests
CREATE POLICY "Users can manage own deletion requests"
    ON data_deletion_requests FOR ALL
    USING (user_id = auth.uid());

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'role',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON user_consents
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor_id ON doctor_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_patient_id ON doctor_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_patient_id ON questionnaires(patient_id);
CREATE INDEX IF NOT EXISTS idx_questionnaires_completed_at ON questionnaires(completed_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON data_deletion_requests(user_id);

-- Insert default consent types
INSERT INTO user_consents (user_id, consent_type, consent_text, version)
SELECT
    p.id,
    'terms_of_service',
    'Eu li e aceito os Termos de Uso do aplicativo QSM-H',
    '1.0'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_consents uc
    WHERE uc.user_id = p.id AND uc.consent_type = 'terms_of_service'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_consents (user_id, consent_type, consent_text, version)
SELECT
    p.id,
    'privacy_policy',
    'Eu li e aceito a Política de Privacidade do aplicativo QSM-H',
    '1.0'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_consents uc
    WHERE uc.user_id = p.id AND uc.consent_type = 'privacy_policy'
)
ON CONFLICT DO NOTHING;
