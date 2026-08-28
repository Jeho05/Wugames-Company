/**
 * Indicateur de statut live/demo - point vert simple
 * Apparaît uniquement quand les données API sont chargées
 */
interface LiveIndicatorProps {
  live: boolean;
  className?: string;
}

export function LiveIndicator({ live, className = "" }: LiveIndicatorProps) {
  if (!live) return null;

  return (
    <span
      aria-label="Données en direct"
      className={`inline-flex size-2 rounded-full bg-emerald-500 ${className}`}
      role="status"
      title="Données en direct"
    />
  );
}
