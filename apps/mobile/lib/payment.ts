// Thin wrappers around @stripe/stripe-react-native. Intentionally stubbed so
// the scaffold compiles without real Stripe keys. Wire these up in the Stripe
// task — see PLAN.md §7 step 8.

export async function connectApplePay() {
  console.warn('TODO: present PaymentSheet with Apple Pay enabled, save PM to backend');
}

export async function connectBankAccount() {
  console.warn('TODO: open Stripe Financial Connections session for Bank of America');
}
