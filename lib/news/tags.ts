const ASSET_RULES: { tag: string; pattern: RegExp }[] = [
  { tag: "BTC", pattern: /\b(bitcoin|btc)\b/i },
  { tag: "ETH", pattern: /\b(ethereum|ether|eth)\b/i },
  { tag: "SOL", pattern: /\b(solana|sol)\b/i },
  { tag: "ADA", pattern: /\b(cardano|ada)\b/i },
  { tag: "XRP", pattern: /\b(ripple|xrp)\b/i },
  { tag: "NEAR", pattern: /\bnear protocol\b/i },
  { tag: "NEAR", pattern: /\bNEAR\b/ },
];

const GENERAL =
  /\b(regulat\w*|exchanges?|stablecoins?|defi|markets?|sec|etf|trading|crypto)\b/i;

export function tagsFor(title: string, excerpt: string) {
  const text = `${title}\n${excerpt}`;
  const tags: string[] = [];
  for (const rule of ASSET_RULES) {
    if (rule.pattern.test(text) && !tags.includes(rule.tag)) tags.push(rule.tag);
  }
  if (tags.length === 0 || GENERAL.test(text)) tags.push("CRYPTO");
  return tags;
}

export function primaryTag(tags: string[]) {
  return tags.find((tag) => tag !== "CRYPTO") ?? tags[0] ?? "CRYPTO";
}
