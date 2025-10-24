import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';


// Force dynamic rendering - required for cookies/auth
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Pegar todos os cookies
    const allCookies = request.cookies.getAll();
    const supabaseCookies = allCookies.filter(c =>
      c.name.startsWith('sb-') || c.name.includes('auth')
    );

    console.log('Test auth - Cookies:', allCookies.map(c => c.name));

    // Tentar pegar a sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Tentar pegar o usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Se autenticado, pegar perfil
    let profile = null;
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', user.id)
        .single();
      profile = profileData;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isNetlify: !!process.env.NETLIFY,
      authenticated: !!user,
      hasSession: !!sessionData.session,
      session: sessionData.session ? {
        expiresAt: sessionData.session.expires_at,
        expiresIn: sessionData.session.expires_in,
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
      } : null,
      profile: profile,
      errors: {
        session: sessionError?.message || null,
        auth: authError?.message || null,
      },
      cookies: {
        total: allCookies.length,
        names: allCookies.map(c => c.name),
        supabase: supabaseCookies.map(c => ({
          name: c.name,
          length: c.value.length,
          preview: c.value.substring(0, 30) + '...'
        })),
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
