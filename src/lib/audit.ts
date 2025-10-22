/**
 * LGPD Audit Logging System
 * Tracks access to sensitive personal data for compliance
 */

import { createClient } from '@/lib/supabase/client'

export type AuditAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'share'
  | 'access_denied'

interface AuditLogParams {
  userId: string
  targetUserId: string
  action: AuditAction
  tableName: string
  recordId?: string
  details?: Record<string, any>
}

/**
 * Logs an audit event for LGPD compliance
 * All access to personal data should be logged
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.rpc('log_data_access', {
      p_user_id: params.userId,
      p_target_user_id: params.targetUserId,
      p_action: params.action,
      p_table_name: params.tableName,
      p_record_id: params.recordId || null,
      p_details: params.details || null
    })

    if (error) {
      console.error('Erro ao registrar log de auditoria:', error)
    }
  } catch (err) {
    console.error('Erro ao registrar log de auditoria:', err)
  }
}

/**
 * Hook to automatically log when a user views their profile
 */
export async function logProfileView(userId: string): Promise<void> {
  await logAuditEvent({
    userId,
    targetUserId: userId,
    action: 'view',
    tableName: 'profiles'
  })
}

/**
 * Hook to log when a doctor views patient data
 */
export async function logPatientDataView(
  doctorId: string,
  patientId: string,
  recordId?: string
): Promise<void> {
  await logAuditEvent({
    userId: doctorId,
    targetUserId: patientId,
    action: 'view',
    tableName: 'questionnaires',
    recordId,
    details: {
      relationship: 'doctor-patient'
    }
  })
}

/**
 * Hook to log when a questionnaire is created
 */
export async function logQuestionnaireCreation(
  userId: string,
  questionnaireId: string
): Promise<void> {
  await logAuditEvent({
    userId,
    targetUserId: userId,
    action: 'create',
    tableName: 'questionnaires',
    recordId: questionnaireId
  })
}

/**
 * Hook to log when user data is exported
 */
export async function logDataExport(userId: string): Promise<void> {
  await logAuditEvent({
    userId,
    targetUserId: userId,
    action: 'export',
    tableName: 'profiles',
    details: {
      export_type: 'full_data_export',
      format: 'json'
    }
  })
}

/**
 * Hook to log when a user updates their profile
 */
export async function logProfileUpdate(
  userId: string,
  changedFields: string[]
): Promise<void> {
  await logAuditEvent({
    userId,
    targetUserId: userId,
    action: 'update',
    tableName: 'profiles',
    details: {
      changed_fields: changedFields
    }
  })
}

/**
 * Hook to log access denied events
 */
export async function logAccessDenied(
  userId: string,
  targetUserId: string,
  tableName: string,
  reason: string
): Promise<void> {
  await logAuditEvent({
    userId,
    targetUserId,
    action: 'access_denied',
    tableName,
    details: {
      reason
    }
  })
}

/**
 * Retrieve audit logs for a user (for transparency)
 */
export async function getUserAuditLogs(userId: string, limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar logs de auditoria:', error)
    return []
  }

  return data || []
}
