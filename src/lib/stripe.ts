import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_ID = 'price_1TBH3jGv40DAeStqxu0qjVTE';

/**
 * Creates a Stripe Checkout session for a new subscription.
 * Passes userId as client_reference_id so the webhook can update the profile.
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  existingCustomerId: string | null
): Promise<Stripe.Checkout.Session> {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=cancelled`,
  };

  if (existingCustomerId) {
    params.customer = existingCustomerId;
  } else {
    params.customer_email = email;
  }

  return stripe.checkout.sessions.create(params);
}

/**
 * Creates a Stripe Billing Portal session so the customer can manage their subscription.
 */
export async function createCustomerPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });
}
