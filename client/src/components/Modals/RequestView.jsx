export default function ViewProgress({ header, details }) {
  return (
    <details className="accordion mb-3 border border rounded-3">
      <summary className="open:bg-danger p-3 rounded-top-3">{header}</summary>

      <p className="px-3 mt-3">{details}</p>

      <div className="d-flex gap-3 m-3 border border-bottom-0 border-start-0 border-end-0">
        <p className="fw-bold mt-3 mb-0 text-button border">Accept</p>
        <p className="fw-bold mt-3 mb-0 text-button border">Reject</p>
      </div>
    </details>
  );
}
