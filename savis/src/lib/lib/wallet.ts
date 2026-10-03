// Simulated SAVIS Wallet (prototype — no real money)

export type WalletTx = {
  id: string;
  type: "hold" | "release" | "refund" | "topup";
  amount: number;
  label: string;
  jobId?: string;
  createdAt: string;
};

const BALANCE_KEY = "savis_wallet_balance";
const TX_KEY = "savis_wallet_tx";

export function getBalance(): number {
  if (typeof window === "undefined") return 5000;
  const v = localStorage.getItem(BALANCE_KEY);
  if (v === null) {
    localStorage.setItem(BALANCE_KEY, "5000");
    return 5000;
  }
  return Number(v) || 0;
}

function setBalance(n: number) {
  localStorage.setItem(BALANCE_KEY, String(Math.max(0, n)));
}

export function getTransactions(): WalletTx[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || "[]");
  } catch {
    return [];
  }
}

function pushTx(tx: Omit<WalletTx, "id" | "createdAt">) {
  const list = getTransactions();
  list.unshift({
    ...tx,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(TX_KEY, JSON.stringify(list.slice(0, 50)));
}

/** Hold funds for a job (escrow) */
export function holdForJob(
  amount: number,
  jobId: string,
  label: string
): { ok: boolean; message: string } {
  const bal = getBalance();
  if (amount > bal) {
    return {
      ok: false,
      message: `Not enough balance. You have KSh ${bal.toLocaleString()}.`,
    };
  }
  setBalance(bal - amount);
  pushTx({ type: "hold", amount, label, jobId });
  return { ok: true, message: "Held in SAVIS Wallet escrow" };
}

/** Release to provider when job completes */
export function releaseForJob(
  amount: number,
  jobId: string,
  label: string
): void {
  pushTx({ type: "release", amount, label, jobId });
  // Provider "receives" money in prototype — consumer already paid into hold
}

/** Refund on decline */
export function refundForJob(
  amount: number,
  jobId: string,
  label: string
): void {
  setBalance(getBalance() + amount);
  pushTx({ type: "refund", amount, label, jobId });
}

export function topUp(amount: number): void {
  setBalance(getBalance() + amount);
  pushTx({ type: "topup", amount, label: "M-Pesa top-up (sample)" });
}
