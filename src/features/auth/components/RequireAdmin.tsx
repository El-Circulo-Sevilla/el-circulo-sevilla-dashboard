import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { adminAuthService, type AccessState } from '@/features/auth/services/adminAuthService';

type GuardState = AccessState | { status: 'loading' };

export const RequireAdmin = () => {
  const [state, setState] = useState<GuardState>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;

    const check = async () => {
      const result = await adminAuthService.resolveAdminAccess();
      if (!isActive) return;
      setState(result);
    };

    void check();

    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
        <Card className="flex items-center gap-2">
          <Spinner />
          <p className="text-sm text-mute">Comprobando permisos de administrador...</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (state.status === 'unauthorized') {
    return <Navigate to="/no-autorizado" replace />;
  }

  if (state.status === 'config_error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
        <Card className="max-w-lg space-y-2">
          <h1 className="text-lg font-bold text-ink">Configuración incompleta</h1>
          <p className="text-sm text-mute">{state.message}</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
        <Card className="max-w-lg space-y-2">
          <h1 className="text-lg font-bold text-ink">No se pudo validar el acceso</h1>
          <p className="text-sm text-mute">{state.message}</p>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};
