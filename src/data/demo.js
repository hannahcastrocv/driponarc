/* ============================================================================
   Demo / mock data for the preview. Replace every value here after launch, or
   move these reads into src/lib/stats.js once live data is wired.
   ============================================================================ */
export const DEMO = {
  token: { totalSupply: 1_000_000_000, circulating: 916_578_098, holders: 8421 },
  usdcReflected: 124582.42,
  dripBurned: 83_421_902,
  burnedPct: 8.34,
  buybacksUsd: 42190.0,
  dripBought: 12_845_122,
  buybackTxns: 156,
  // Fee split: 50% USDC reflections, 25% combined burn and buyback, 25% treasury.
  // Buy tax and sell tax are each 1%.
  fees: { reflection: 50, burnBuyback: 25, treasury: 25, buyTax: 1, sellTax: 1 },

  wallet: {
    address: "0x8a71...4f3B",
    balance: 125_420_690,
    balanceUsd: 3214.65,
    reflectionsEarned: 152.84,
    totalReflections: 189.37,
    monthly: 45.67,
    burnedFromYou: 1245.32,
    burnedFromYouUsd: 31.89,
    buybacksBenefited: 87.14,
    buybacksBenefitedUsd: 2.23,
  },

  reflectionsSeries: [
    { label: "May 14", value: 31000 }, { label: "May 21", value: 52000 },
    { label: "May 28", value: 71000 }, { label: "Jun 4", value: 98000 },
    { label: "Jun 11", value: 118000 }, { label: "Jun 18", value: 124582 },
  ],
  burnsSeries: [
    { label: "May 14", value: 22_000_000 }, { label: "May 21", value: 38_000_000 },
    { label: "May 28", value: 51_000_000 }, { label: "Jun 4", value: 64_000_000 },
    { label: "Jun 11", value: 76_000_000 }, { label: "Jun 18", value: 83_421_902 },
  ],
  buybackSeries: [
    { label: "May 14", value: 3_000_000 }, { label: "May 21", value: 5_400_000 },
    { label: "May 28", value: 7_100_000 }, { label: "Jun 4", value: 9_200_000 },
    { label: "Jun 11", value: 11_300_000 }, { label: "Jun 18", value: 12_845_122 },
  ],

  latestBurn: { amount: 125_242, tx: "0x9f2b...e8ab", time: "12 sec ago" },
  last7dBurned: 4_521_882,
  recentBurns: [
    { tx: "0x9f2b...e8ab", amount: 125_242, time: "12 sec ago" },
    { tx: "0x41c8...7d19", amount: 88_610, time: "4 min ago" },
    { tx: "0xa30e...b2f5", amount: 210_744, time: "22 min ago" },
    { tx: "0x77de...19c3", amount: 54_902, time: "1 hr ago" },
    { tx: "0xc9a1...0e6d", amount: 173_318, time: "3 hr ago" },
  ],
  recentBuybacks: [
    { tx: "0x22fa...c410", usdc: 640.0, drip: 214_330, time: "8 min ago" },
    { tx: "0x8b03...f7a2", usdc: 1180.0, drip: 402_115, time: "37 min ago" },
    { tx: "0x5e19...3ba8", usdc: 520.5, drip: 176_240, time: "2 hr ago" },
    { tx: "0xd041...9c72", usdc: 905.0, drip: 309_880, time: "5 hr ago" },
  ],
  recentReflections: [
    { wallet: "0x3f8c...9ab2", usdc: 12.44, time: "2 min ago" },
    { wallet: "0xbe20...41d7", usdc: 5.9, time: "11 min ago" },
    { wallet: "0x77a1...c0e8", usdc: 33.18, time: "26 min ago" },
    { wallet: "0x1902...7f4c", usdc: 2.07, time: "48 min ago" },
  ],
};
