import { Fragment } from "react";

// Inline SVG flags — emoji flags don't render on Windows, so we draw them.

// One trigram (3 bars) for the Korean flag, rotated along the flag's diagonal.
function Trigram({ cx, cy, rot, p }: { cx: number; cy: number; rot: number; p: boolean[] }) {
  const w = 4.6, h = 0.7, gap = 1.2;
  const x = cx - w / 2;
  return (
    <g fill="#1a1a1a" transform={`rotate(${rot} ${cx} ${cy})`}>
      {p.map((broken, i) => {
        const y = cy - gap + i * gap - h / 2;
        return broken ? (
          <Fragment key={i}>
            <rect x={x} y={y} width={w * 0.42} height={h} rx={0.1} />
            <rect x={x + w * 0.58} y={y} width={w * 0.42} height={h} rx={0.1} />
          </Fragment>
        ) : (
          <rect key={i} x={x} y={y} width={w} height={h} rx={0.1} />
        );
      })}
    </g>
  );
}

export function FlagKR({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="한국어">
      <rect width="30" height="20" fill="#fff" />
      {/* taegeuk — red over blue, rotated to the flag's 33.69° axis */}
      <g transform="rotate(-33.69 15 10)">
        <circle cx="15" cy="10" r="5" fill="#0047a0" />
        <path d="M10 10 a5 5 0 0 1 10 0 a2.5 2.5 0 0 1 -5 0 a2.5 2.5 0 0 0 -5 0 z" fill="#cd2e3a" />
      </g>
      {/* four trigrams, angled along the diagonals */}
      <Trigram cx={6.2} cy={5.2} rot={-33.69} p={[false, false, false]} />
      <Trigram cx={23.8} cy={5.2} rot={33.69} p={[true, false, true]} />
      <Trigram cx={6.2} cy={14.8} rot={33.69} p={[false, true, false]} />
      <Trigram cx={23.8} cy={14.8} rot={-33.69} p={[true, true, true]} />
    </svg>
  );
}

export function FlagUS({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="English">
      <rect width="30" height="20" fill="#fff" />
      <g fill="#b22234">
        <rect width="30" height="1.538" y="0" />
        <rect width="30" height="1.538" y="3.077" />
        <rect width="30" height="1.538" y="6.154" />
        <rect width="30" height="1.538" y="9.231" />
        <rect width="30" height="1.538" y="12.308" />
        <rect width="30" height="1.538" y="15.385" />
        <rect width="30" height="1.538" y="18.462" />
      </g>
      <rect width="12" height="10.769" fill="#3c3b6e" />
      <g fill="#fff">
        {[1.7, 3.8, 5.9, 8.0, 9.9].map((cy, r) =>
          (r % 2 === 0 ? [2, 4.4, 6.8, 9.2] : [3.2, 5.6, 8.0]).map((cx, i) => (
            <circle key={`${r}-${i}`} cx={cx} cy={cy} r={0.42} />
          ))
        )}
      </g>
    </svg>
  );
}
