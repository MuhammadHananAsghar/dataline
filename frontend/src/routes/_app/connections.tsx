import { createFileRoute } from "@tanstack/react-router";
import { ConnectionSelector } from "@/components/Connection/ConnectionSelector";

export const Route = createFileRoute("/_app/connections")({
  component: ConnectionSelector,
}); 