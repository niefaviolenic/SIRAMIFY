import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role');

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(new URL('/masuk?error=auth_failed', request.url));
    }

    // Jika ada role dari query parameter (untuk registrasi Google)
    if (role && data.user) {
      // Simpan/update user ke tabel users (langsung masuk ke auth.users dan tabel users)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: role,
          status: 'active',
        }, {
          onConflict: 'id'
        });

      if (userError) {
        console.error('Error saving user to users table:', userError);
        // Tetap lanjutkan, user sudah ada di auth.users
      } else {
        console.log('User saved to users table successfully');
      }
    } else if (data.user) {
      // Jika tidak ada role (login biasa dengan Google), cek apakah user sudah ada
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Jika belum ada, buat dengan role default dari metadata atau 'pembeli'
      if (!existingUser) {
        const defaultRole = data.user.user_metadata?.role || 'pembeli';
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: defaultRole,
            status: 'active',
          });
      }
    }

    // Redirect berdasarkan role
    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const userRole = userData?.role || data.user.user_metadata?.role || role || 'pembeli';
      
      if (userRole === 'petani') {
        return NextResponse.redirect(new URL('/petani/beranda', request.url));
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/beranda', request.url));
      } else {
        return NextResponse.redirect(new URL('/pembeli/beranda', request.url));
      }
    }
  }

  return NextResponse.redirect(new URL('/masuk', request.url));
}

