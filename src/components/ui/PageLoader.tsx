export function PageLoader(): JSX.Element {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__bar">
        <div className="page-loader__bar-fill" />
      </div>
      <span className="page-loader__label">Loading.....</span>
    </div>
  );
}
