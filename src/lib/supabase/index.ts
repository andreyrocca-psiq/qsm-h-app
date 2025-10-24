// Re-export browser client for components
export { supabase, createClient } from './client';

// Re-export types
export type {
  UserRole,
  Profile,
  DoctorPatient,
  Questionnaire,
  PushSubscription,
} from '../supabase';
