export default function ViewProgress({ header, details, role }) {
  return (
    <details className="accordion mb-3 border border rounded-3">
      <summary className="open:bg-danger p-3 rounded-top-3">{header}</summary>

      <p className="px-3 mt-3">{details}</p>
    </details>
  );
}
