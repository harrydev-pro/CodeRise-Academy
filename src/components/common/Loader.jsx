import { LoaderCircle } from "lucide-react";

export function Loader({ fullScreen = false, label = "Loading..." }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <LoaderCircle
        className="animate-spin text-brand-600"
        size={32}
      />

      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;