import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type UserRole = 'patient' | 'doctor';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorPatient {
  id: string;
  doctor_id: string;
  patient_id: string;
  invited_at: string;
  accepted_at: string | null;
}

export interface Questionnaire {
  id: string;
  patient_id: string;
  completed_at: string;

  // Depressive symptoms (PHQ-9)
  dep1: number;
  dep2: number;
  dep3: number;
  dep4: number;
  dep5: number;
  dep6: number;
  dep7: number;
  dep8: number;
  dep9: number;
  dep_total: number;

  // Activation symptoms (PMQ-9)
  act1: number;
  act2: number;
  act3: number;
  act4: number;
  act5: number;
  act6: number;
  act7: number;
  act8: number;
  act9: number;
  act_total: number;

  combined_total: number;

  // Habits
  sleep_hours: string;
  sleep_quality: string;
  sleep_routine: string;
  medication: string;
  exercise: string;
  alcohol: string;
  drugs: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
  updated_at: string;
}
