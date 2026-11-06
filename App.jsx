import { Suspense } from "react";
import Loader from "./src/components/common/Loader";
import AppRoutes from "./src/app/routes";
import AppErrorBoundary from "./src/AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<Loader fullScreen />}>
        <AppRoutes />
      </Suspense>
    </AppErrorBoundary>
  );
}
