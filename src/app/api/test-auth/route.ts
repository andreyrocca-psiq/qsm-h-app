import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Tentar pegar o usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
      authError: authError ? authError.message : null,
      cookies: request.cookies.getAll().map(c => c.name),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
