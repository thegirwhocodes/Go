import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { api } from './api';

export async function connectCard() {
  return connectPaymentMethod();
}

export async function connectBankAccount() {
  return connectPaymentMethod();
}

async function connectPaymentMethod() {
  const setup = await api.createSetupIntent();
  const init = await initPaymentSheet({
    merchantDisplayName: 'Go',
    setupIntentClientSecret: setup.clientSecret,
    allowsDelayedPaymentMethods: true,
    returnURL: 'classontime://stripe-redirect',
    style: 'alwaysLight',
    primaryButtonLabel: 'Authorize commitment',
  });
  if (init.error) throw new Error(init.error.message);

  const result = await presentPaymentSheet();
  if (result.error) throw new Error(result.error.message);

  await api.syncPaymentMethod(setup.setupIntentId);
  return setup;
}
