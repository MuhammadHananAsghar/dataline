import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import UmamiScript from "@/components/Landing/Umami";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <UmamiScript />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center mt-8" id="error-page">
      <h1>Oops!</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  ),
});
