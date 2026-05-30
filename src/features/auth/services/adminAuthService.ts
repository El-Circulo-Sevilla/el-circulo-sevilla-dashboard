import type { User } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';
import { toAppError } from '@/lib/serviceResult';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

export type AccessState =
  | { status: 'authenticated'; user: User; role: string }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'config_error'; message: string }
  | { status: 'error'; message: string };

const getAuthRedirectOrigin = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return import.meta.env.VITE_SITE_URL ?? '';
};

export const adminAuthService = {
  async signInWithGoogle() {
    if (!hasSupabaseEnv || !supabase) {
      return {
        ok: false,
        message:
          'Falta configuración de Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
      };
    }

    const redirectTo = `${getAuthRedirectOrigin()}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      return {
        ok: false,
        message: toAppError(error, 'AUTH_GOOGLE_SIGN_IN_FAILED', 'No se pudo iniciar sesión con Google')
          .message,
      };
    }

    return { ok: true, message: null };
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async resolveAdminAccess(): Promise<AccessState> {
    if (!hasSupabaseEnv || !supabase) {
      return {
        status: 'config_error',
        message:
          'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar el login de administrador.',
      };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { status: 'unauthenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return {
        status: 'error',
        message: toAppError(
          profileError,
          'AUTH_PROFILE_ROLE_FETCH_FAILED',
          'No se pudo comprobar el rol del usuario.',
        ).message,
      };
    }

    const roleValue =
      profile && typeof profile === 'object' && 'role' in profile
        ? String((profile as { role: unknown }).role ?? '').toLowerCase()
        : '';

    if (!ADMIN_ROLES.has(roleValue)) {
      await supabase.auth.signOut();
      return { status: 'unauthorized' };
    }

    return { status: 'authenticated', user, role: roleValue };
  },
};
