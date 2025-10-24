import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Listar conexões aceitas (médicos do paciente ou pacientes do médico)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    if (profile.role === 'patient') {
      // Paciente: listar médicos conectados
      const { data: connections } = await supabase
        .from('doctor_patient')
        .select(`
          id,
          invited_at,
          accepted_at,
          doctor_id,
          profiles!doctor_patient_doctor_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('patient_id', user.id)
        .not('accepted_at', 'is', null)
        .order('accepted_at', { ascending: false });

      return NextResponse.json({
        connections: connections?.map(conn => ({
          id: conn.id,
          connectedAt: conn.accepted_at,
          doctor: conn.profiles,
        })) || [],
      });
    } else {
      // Médico: listar pacientes conectados
      const { data: connections } = await supabase
        .from('doctor_patient')
        .select(`
          id,
          invited_at,
          accepted_at,
          patient_id,
          profiles!doctor_patient_patient_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('doctor_id', user.id)
        .not('accepted_at', 'is', null)
        .order('accepted_at', { ascending: false });

      return NextResponse.json({
        connections: connections?.map(conn => ({
          id: conn.id,
          connectedAt: conn.accepted_at,
          patient: conn.profiles,
        })) || [],
      });
    }
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conexões' },
      { status: 500 }
    );
  }
}
