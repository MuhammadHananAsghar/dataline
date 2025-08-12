import { createFileRoute, redirect } from "@tanstack/react-router";
import Login from "@components/Library/Login";
import { queryClient } from "@/queryClient";
import { isAuthenticatedQuery } from "@/hooks/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const isAuthenticated = await queryClient.fetchQuery(isAuthenticatedQuery());
    if (isAuthenticated) {
      throw redirect({ to: "/connections" });
    }
  },
  component: Login,
});
