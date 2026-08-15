import { useEffect, useState, lazy, Suspense } from "react";

const ClientApp = lazy(() => import("./ClientApp").then((m) => ({ default: m.ClientApp })));

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
  </div>
);

export function AppRoot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Spinner />;
  return (
    <Suspense fallback={<Spinner />}>
      <ClientApp />
    </Suspense>
  );
}
