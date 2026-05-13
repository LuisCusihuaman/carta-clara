import { lazy, Suspense } from "react";

const PhotoPage = lazy(() => import("@features/photo/PhotoPage"));

export function PhotoRoute() {
  return (
    <Suspense fallback={<div className="p-5 text-muted">Cargando camara...</div>}>
      <PhotoPage />
    </Suspense>
  );
}
