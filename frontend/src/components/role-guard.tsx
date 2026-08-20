import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/authTypes";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="font-display text-xl font-semibold">
            Loading...
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Verifying your access.
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <div className="font-display text-xl font-semibold">
          Authentication required
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          Please log in to access this page.
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <div className="font-display text-xl font-semibold">
          Access denied
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          Your current role does not have permission to view this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

