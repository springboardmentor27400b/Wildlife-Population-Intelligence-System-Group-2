import { createFileRoute } from "@tanstack/react-router";
// Root handled by AppRoot (React Router DOM). This route just satisfies TanStack.
export const Route = createFileRoute("/")({ component: () => null });
