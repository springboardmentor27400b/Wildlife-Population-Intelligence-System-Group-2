import { createFileRoute } from "@tanstack/react-router";
// Splat route so React Router DOM (mounted in __root) can handle every URL.
export const Route = createFileRoute("/$")({ component: () => null });
