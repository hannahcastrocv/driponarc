export const usd = (n) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const num = (n) => Number(n).toLocaleString("en-US");

export const compact = (n) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const shortenAddress = (a) =>
  a && a.length > 14 ? a.slice(0, 6) + "..." + a.slice(-4) : a;

export const pct = (n, digits = 2) =>
  `${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
