import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminAuthService } from '@/features/auth/services/adminAuthService';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminAuthService.signInWithGoogle();
      if (!result.ok) {
        setError(result.message ?? 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-300/40 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md space-y-6 border-brand-300 bg-white/95 p-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-14 w-14 overflow-hidden rounded-2xl border border-brand-300 bg-brand-50">
            <img src="/logo.png" alt="El Círculo Sevilla" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Acceso al Dashboard</h1>
          <p className="text-sm text-mute">
            Inicia sesión con Google. Solo los perfiles con rol de administrador pueden entrar.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button onClick={onLogin} isLoading={loading} className="w-full">
          Continuar con Google
        </Button>
      </Card>
    </div>
  );
};
