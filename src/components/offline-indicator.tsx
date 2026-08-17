import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function getOnlineStatus() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineIndicator() {
  const online = useSyncExternalStore(
    subscribe,
    getOnlineStatus,
    () => true,
  );

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
      <WifiOff className="h-4 w-4" />
      <span>Sin conexión. Puedes seguir consultando datos guardados.</span>
    </div>
  );
}
