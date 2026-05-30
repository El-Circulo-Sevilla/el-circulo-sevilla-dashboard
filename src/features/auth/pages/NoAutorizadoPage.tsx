import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminAuthService } from '@/features/auth/services/adminAuthService';

export const NoAutorizadoPage = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
    <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-300/40 blur-3xl" />

    <Card className="relative z-10 w-full max-w-lg space-y-5 border-brand-300 bg-white/95 p-8 text-center">
      <h1 className="text-2xl font-bold text-ink">Acceso no autorizado</h1>
      <p className="text-sm text-mute">
        Tu cuenta no tiene permisos de administración para este dashboard.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          onClick={() => {
            void adminAuthService.signOut();
          }}
        >
          Cerrar sesión
        </Button>
        <Link to="/login">
          <Button>Volver al login</Button>
        </Link>
      </div>
    </Card>
  </div>
);
