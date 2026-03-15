import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Must read the raw body as text for Stripe signature verification.
// Next.js App Router does not auto-parse the body, so request.text() gives us
// the exact bytes Stripe signed.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  try {
    switch (event.type) {
      // ── Checkout completed → grant Pro, save customer ID ───────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;

        if (!userId) {
          console.error('checkout.session.completed missing client_reference_id');
          break;
        }

        const { error } = await adminSupabase
          .from('profiles')
          .update({ plan: 'pro', stripe_customer_id: customerId })
          .eq('id', userId);

        if (error) {
          console.error('Failed to upgrade user to pro:', error.message);
        }
        break;
      }

      // ── Subscription cancelled → revert to Free ─────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await adminSupabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to downgrade user to free:', error.message);
        }
        break;
      }

      // ── Subscription updated → sync plan status ─────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        const { error } = await adminSupabase
          .from('profiles')
          .update({ plan: isActive ? 'pro' : 'free' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to sync subscription status:', error.message);
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge and ignore
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err instanceof Error ? err.message : err);
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true });
}
