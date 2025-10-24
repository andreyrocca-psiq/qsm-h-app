import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Buscar médicos por email (para paciente procurar)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é paciente
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (patientProfile?.role !== 'patient') {
      return NextResponse.json(
        { error: 'Apenas pacientes podem buscar médicos' },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar médico pelo email
    const { data: doctors } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('role', 'doctor')
      .ilike('email', email)
      .limit(5);

    if (!doctors || doctors.length === 0) {
      return NextResponse.json(
        { doctors: [] }
      );
    }

    // Para cada médico, verificar se já existe relação
    const doctorsWithStatus = await Promise.all(
      doctors.map(async (doctor) => {
        const { data: existing } = await supabase
          .from('doctor_patient')
          .select('id, accepted_at')
          .eq('doctor_id', doctor.id)
          .eq('patient_id', user.id)
          .single();

        let status: 'none' | 'pending' | 'connected' = 'none';
        if (existing) {
          status = existing.accepted_at ? 'connected' : 'pending';
        }

        return {
          id: doctor.id,
          name: doctor.full_name,
          email: doctor.email,
          status,
        };
      })
    );

    return NextResponse.json({
      doctors: doctorsWithStatus,
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médicos' },
      { status: 500 }
    );
  }
}
