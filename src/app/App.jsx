import { Suspense } from "react";
import Loader from "../components/common/Loader";
import AppRoutes from "./routes";
import AppErrorBoundary from "./AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<Loader fullScreen />}>
        <AppRoutes />
      </Suspense>
    </AppErrorBoundary>
  );
}
