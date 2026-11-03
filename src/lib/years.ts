import papers from '../content/papers.json';

// Most recent publication year in papers.json — updates automatically when a new volume is added.
export const LATEST_YEAR: number = Math.max(
  ...papers.map((p) => Number(p.year)).filter((y) => Number.isFinite(y)),
);
