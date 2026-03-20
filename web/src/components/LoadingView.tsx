export function LoadingView({ label = 'Loading SiteTrack...' }: { label?: string }) {
  return (
    <div className="loading-view">
      <div className="loading-spinner" />
      <p>{label}</p>
    </div>
  );
}
