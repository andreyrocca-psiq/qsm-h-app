/**
 * LGPD Consent Management System
 * Manages user consents for data processing
 */

import { createClient } from '@/lib/supabase/client'

export type ConsentType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'data_processing'
  | 'data_sharing'
  | 'marketing'
  | 'push_notifications'

export const CURRENT_TERMS_VERSION = '1.0.0'
export const CURRENT_PRIVACY_VERSION = '1.0.0'

interface ConsentParams {
  userId: string
  consentType: ConsentType
  granted: boolean
  version: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Records a user consent
 */
export async function recordConsent(params: ConsentParams): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('consent_records').insert({
      user_id: params.userId,
      consent_type: params.consentType,
      granted: params.granted,
      version: params.version,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      granted_at: params.granted ? new Date().toISOString() : null,
      revoked_at: !params.granted ? new Date().toISOString() : null
    })

    if (error) {
      console.error('Erro ao registrar consentimento:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Erro ao registrar consentimento:', err)
    return false
  }
}

/**
 * Records all required consents during signup
 */
export async function recordSignupConsents(
  userId: string,
  consents: {
    termsAccepted: boolean
    privacyAccepted: boolean
    dataProcessingAccepted: boolean
  }
): Promise<boolean> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined

  const results = await Promise.all([
    recordConsent({
      userId,
      consentType: 'terms_of_service',
      granted: consents.termsAccepted,
      version: CURRENT_TERMS_VERSION,
      userAgent
    }),
    recordConsent({
      userId,
      consentType: 'privacy_policy',
      granted: consents.privacyAccepted,
      version: CURRENT_PRIVACY_VERSION,
      userAgent
    }),
    recordConsent({
      userId,
      consentType: 'data_processing',
      granted: consents.dataProcessingAccepted,
      version: CURRENT_PRIVACY_VERSION,
      userAgent
    })
  ])

  return results.every(result => result === true)
}

/**
 * Updates a specific consent
 */
export async function updateConsent(
  userId: string,
  consentType: ConsentType,
  granted: boolean
): Promise<boolean> {
  const version =
    consentType === 'terms_of_service'
      ? CURRENT_TERMS_VERSION
      : CURRENT_PRIVACY_VERSION

  return recordConsent({
    userId,
    consentType,
    granted,
    version
  })
}

/**
 * Retrieves all consents for a user
 */
export async function getUserConsents(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar consentimentos:', error)
    return []
  }

  return data || []
}

/**
 * Checks if user has granted a specific consent
 */
export async function hasActiveConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('user_id', userId)
    .eq('consent_type', consentType)
    .eq('granted', true)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return false
  }

  return !!data
}

/**
 * Checks if user has accepted all required consents
 */
export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const requiredConsents: ConsentType[] = [
    'terms_of_service',
    'privacy_policy',
    'data_processing'
  ]

  const results = await Promise.all(
    requiredConsents.map(type => hasActiveConsent(userId, type))
  )

  return results.every(result => result === true)
}

/**
 * Revokes a consent
 */
export async function revokeConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  return updateConsent(userId, consentType, false)
}
