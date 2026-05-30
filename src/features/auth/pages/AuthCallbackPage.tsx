import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { adminAuthService } from '@/features/auth/services/adminAuthService';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const resolve = async () => {
      const result = await adminAuthService.resolveAdminAccess();
      if (!isActive) return;

      if (result.status === 'authenticated') {
        navigate('/dashboard/eventos', { replace: true });
        return;
      }

      if (result.status === 'unauthorized') {
        navigate('/no-autorizado', { replace: true });
        return;
      }

      navigate('/login', { replace: true });
    };

    void resolve();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="flex items-center gap-2">
        <Spinner />
        <p className="text-sm text-mute">Validando sesión con Google...</p>
      </Card>
    </div>
  );
};
