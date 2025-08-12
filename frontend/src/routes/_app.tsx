import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/Home/Main";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});
