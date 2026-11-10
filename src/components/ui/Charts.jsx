// Lightweight SVG charts (no chart library). They scale to their container's width.
export function LineChart({ points, label, height = 160 }) {
  const width = 600;
  const pad = { top: 12, right: 12, bottom: 26, left: 34 };
  if (!points?.length) return <p className="muted-text">No data for this period.</p>;
  const max = Math.max(1, ...points.map((point) => point.count));
  const x = (index) => pad.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * (width - pad.left - pad.right));
  const y = (value) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom);
  const path = points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.count).toFixed(1)}`).join(" ");
  const step = Math.max(1, Math.ceil(points.length / 6));
  const total = points.reduce((sum, point) => sum + point.count, 0);
  return (
    <figure className="ui-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${total} in total`} preserveAspectRatio="none">
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line x1={pad.left} x2={width - pad.right} y1={y(max * ratio)} y2={y(max * ratio)} className="ui-chart-grid" />
            <text x={pad.left - 6} y={y(max * ratio) + 4} textAnchor="end" className="ui-chart-axis">{Math.round(max * ratio)}</text>
          </g>
        ))}
        <path d={`${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} className="ui-chart-area" />
        <path d={path} className="ui-chart-line" />
        {points.map((point, index) => (index % step === 0 || index === points.length - 1) && (
          <text key={point.day} x={x(index)} y={height - 6} textAnchor="middle" className="ui-chart-axis">{point.day.slice(5)}</text>
        ))}
      </svg>
      <figcaption>{label} · {total} total</figcaption>
    </figure>
  );
}

export function BarList({ items, valueKey = "count", labelKey = "title", suffix = "", empty = "No data for this period." }) {
  if (!items?.length) return <p className="muted-text">{empty}</p>;
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey]) || 0));
  return (
    <ul className="ui-bar-list">
      {items.map((item, index) => (
        <li key={`${item[labelKey]}-${index}`}>
          <div className="ui-bar-label"><span>{item[labelKey]}</span><strong>{item[valueKey]}{suffix}</strong></div>
          <div className="ui-bar-track"><div className="ui-bar-fill" style={{ width: `${((Number(item[valueKey]) || 0) / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
