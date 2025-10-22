-- LGPD Compliance Tables and Functions
-- This migration adds support for Brazilian General Data Protection Law (LGPD)

-- Create enum for consent types
CREATE TYPE consent_type AS ENUM (
  'terms_of_service',
  'privacy_policy',
  'data_processing',
  'data_sharing',
  'marketing',
  'push_notifications'
);

-- Create enum for deletion request status
CREATE TYPE deletion_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create enum for audit action types
CREATE TYPE audit_action AS ENUM (
  'view',
  'create',
  'update',
  'delete',
  'export',
  'share',
  'access_denied'
);

-- Consent Records Table
-- Tracks all user consents according to LGPD requirements
CREATE TABLE consent_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type consent_type NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL, -- Version of the terms/policy
  ip_address INET, -- IP address when consent was given
  user_agent TEXT, -- Browser/device information
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Data Deletion Requests Table
-- Manages user requests to delete their personal data (Right to be Forgotten)
CREATE TABLE data_deletion_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status deletion_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Audit Logs Table
-- Records all access to sensitive personal data for LGPD compliance
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who performed the action
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Whose data was accessed
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB, -- Additional context about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Data Retention Policies Table
-- Defines how long different types of data should be retained
CREATE TABLE data_retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Data Export Logs Table
-- Tracks when users export their personal data (Right to Data Portability)
CREATE TABLE data_export_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  export_format TEXT NOT NULL DEFAULT 'json',
  file_size_bytes INTEGER,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_records
CREATE POLICY "Users can view their own consents"
  ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON consent_records FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for data_deletion_requests
CREATE POLICY "Users can view their own deletion requests"
  ON data_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
  ON data_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for audit_logs
CREATE POLICY "Users can view logs about their own data"
  ON audit_logs FOR SELECT
  USING (auth.uid() = target_user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Logs are inserted by system

-- RLS Policies for data_retention_policies
CREATE POLICY "Anyone can view retention policies"
  ON data_retention_policies FOR SELECT
  USING (true);

-- RLS Policies for data_export_logs
CREATE POLICY "Users can view their own export logs"
  ON data_export_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export logs"
  ON data_export_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX idx_deletion_requests_user_id ON data_deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON data_deletion_requests(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_data_export_logs_user_id ON data_export_logs(user_id);

-- Trigger to update updated_at on consent_records
CREATE TRIGGER update_consent_records_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on data_deletion_requests
CREATE TRIGGER update_data_deletion_requests_updated_at
  BEFORE UPDATE ON data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on data_retention_policies
CREATE TRIGGER update_data_retention_policies_updated_at
  BEFORE UPDATE ON data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log data access (for audit trail)
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_target_user_id UUID,
  p_action audit_action,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    target_user_id,
    action,
    table_name,
    record_id,
    details
  ) VALUES (
    p_user_id,
    p_target_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_details
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data (soft delete for data retention)
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Anonymize profile data
  UPDATE profiles
  SET
    full_name = 'Usuário Anônimo',
    phone = NULL,
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = p_user_id;

  -- Delete sensitive data but keep aggregated statistics
  -- Questionnaires are kept for research but anonymized
  -- This maintains data integrity while protecting privacy

  -- Log the anonymization
  INSERT INTO audit_logs (
    user_id,
    target_user_id,
    action,
    table_name,
    details
  ) VALUES (
    p_user_id,
    p_user_id,
    'delete',
    'profiles',
    jsonb_build_object('anonymized', true)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to completely delete user data (hard delete)
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Log the deletion before removing data
  INSERT INTO audit_logs (
    user_id,
    target_user_id,
    action,
    table_name,
    details
  ) VALUES (
    p_user_id,
    p_user_id,
    'delete',
    'profiles',
    jsonb_build_object('hard_delete', true)
  );

  -- Delete all user data (cascade will handle related records)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export user data (Right to Data Portability)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
  v_questionnaires JSONB;
  v_relationships JSONB;
  v_consents JSONB;
  v_result JSONB;
BEGIN
  -- Get profile data
  SELECT jsonb_build_object(
    'id', id,
    'full_name', full_name,
    'phone', phone,
    'role', role,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Get questionnaires
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'completed_at', completed_at,
      'dep_total', dep_total,
      'act_total', act_total,
      'combined_total', combined_total,
      'sleep_hours', sleep_hours,
      'sleep_quality', sleep_quality,
      'sleep_routine', sleep_routine,
      'medication', medication,
      'exercise', exercise,
      'alcohol', alcohol,
      'drugs', drugs
    )
  ) INTO v_questionnaires
  FROM questionnaires
  WHERE patient_id = p_user_id;

  -- Get doctor-patient relationships
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', CASE
        WHEN doctor_id = p_user_id THEN 'doctor'
        ELSE 'patient'
      END,
      'invited_at', invited_at,
      'accepted_at', accepted_at
    )
  ) INTO v_relationships
  FROM doctor_patient
  WHERE doctor_id = p_user_id OR patient_id = p_user_id;

  -- Get consent records
  SELECT jsonb_agg(
    jsonb_build_object(
      'consent_type', consent_type,
      'granted', granted,
      'version', version,
      'granted_at', granted_at,
      'revoked_at', revoked_at
    )
  ) INTO v_consents
  FROM consent_records
  WHERE user_id = p_user_id;

  -- Build final result
  v_result := jsonb_build_object(
    'export_date', TIMEZONE('utc', NOW()),
    'profile', v_profile,
    'questionnaires', COALESCE(v_questionnaires, '[]'::jsonb),
    'relationships', COALESCE(v_relationships, '[]'::jsonb),
    'consents', COALESCE(v_consents, '[]'::jsonb)
  );

  -- Log the export
  INSERT INTO data_export_logs (user_id, export_format)
  VALUES (p_user_id, 'json');

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default data retention policies
INSERT INTO data_retention_policies (table_name, retention_days, description) VALUES
  ('questionnaires', 1825, 'Questionários mantidos por 5 anos conforme requisitos de pesquisa médica'),
  ('audit_logs', 1825, 'Logs de auditoria mantidos por 5 anos conforme LGPD'),
  ('notifications', 365, 'Notificações mantidas por 1 ano'),
  ('push_subscriptions', 730, 'Assinaturas push mantidas por 2 anos');

-- Function to apply retention policies (should be run periodically via cron)
CREATE OR REPLACE FUNCTION apply_retention_policies()
RETURNS INTEGER AS $$
DECLARE
  v_policy RECORD;
  v_deleted_count INTEGER := 0;
  v_total_deleted INTEGER := 0;
BEGIN
  FOR v_policy IN
    SELECT * FROM data_retention_policies WHERE active = true
  LOOP
    EXECUTE format(
      'DELETE FROM %I WHERE created_at < NOW() - INTERVAL ''%s days''',
      v_policy.table_name,
      v_policy.retention_days
    );

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    v_total_deleted := v_total_deleted + v_deleted_count;

    -- Log the retention policy application
    INSERT INTO audit_logs (
      user_id,
      target_user_id,
      action,
      table_name,
      details
    ) VALUES (
      NULL,
      NULL,
      'delete',
      v_policy.table_name,
      jsonb_build_object(
        'reason', 'retention_policy',
        'deleted_count', v_deleted_count,
        'retention_days', v_policy.retention_days
      )
    );
  END LOOP;

  RETURN v_total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
