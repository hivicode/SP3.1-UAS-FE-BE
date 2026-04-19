export function money(value: number): string {
  const amount = Math.max(0, Number(value) || 0);
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function renderStars(rating: number): string {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.max(0, Math.min(5, Math.round(safeRating)));
  return `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
}
