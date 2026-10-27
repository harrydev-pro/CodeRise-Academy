import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Loader } from "../components/common/Loader";
import { AppRoutes } from "./routes";

export default function App() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {AppRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}

        <Route
          path="*"
          element={<Navigate to="/404" replace />}
        />
      </Routes>
    </Suspense>
  );
}
