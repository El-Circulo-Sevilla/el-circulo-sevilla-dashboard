import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { adminAuthService, type AccessState } from '@/features/auth/services/adminAuthService';

type PublicGuardState = AccessState | { status: 'loading' };

export const RedirectIfAuthenticated = () => {
  const [state, setState] = useState<PublicGuardState>({ status: 'loading' });

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
          <p className="text-sm text-mute">Preparando acceso...</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'authenticated') {
    return <Navigate to="/dashboard/eventos" replace />;
  }

  return <Outlet />;
};
