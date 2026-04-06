// =========================================================
// File: app/api/quick-help/route.ts
// =========================================================

/**
 * Minimal pre-sale question endpoint.
 * No WhatsApp, no file uploads, no free chaos.
 *
 * Recommended env vars:
 *   RESEND_API_KEY=re_...
 *   QUICK_HELP_TO=you@example.com
 *   QUICK_HELP_FROM=Siteform <noreply@siteform.studio>
 *
 * If you do not use Resend yet, replace sendQuickHelpEmail()
 * with your own email provider or Make/Zapier webhook.
 */

function qhJson(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

type QuickHelpPayload = {
  email: string;
  question: string;
};

function sanitizeText(value?: string): string {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

async function sendQuickHelpEmail(input: { email: string; question: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUICK_HELP_TO;
  const from = process.env.QUICK_HELP_FROM ?? "Siteform <noreply@siteform.studio>";

  if (!apiKey || !to) {
    console.log("[quick-help:fallback]", input);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Quick Help from ${input.email}`,
      reply_to: input.email,
      text: `Pre-sale question\n\nFrom: ${input.email}\n\nQuestion:\n${input.question}`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Quick help email failed: ${text}`);
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as QuickHelpPayload;
    const email = sanitizeText(payload.email);
    const question = sanitizeText(payload.question);

    if (!email) throw new Error("email is required");
    if (!question) throw new Error("question is required");
    if (question.length > 600) throw new Error("question is too long");

    await sendQuickHelpEmail({ email, question });

    return qhJson({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return qhJson({ ok: false, error: message }, { status: 400 });
  }
}

// =========================================================
// File: app/api/checkout-session-status/route.ts
// =========================================================

import Stripe from "stripe";

const checkoutStatusStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function csJson(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Replace with your real DB lookup.
 * The ideal flow is:
 * 1. Retrieve the Checkout Session from Stripe.
 * 2. Use client_reference_id / metadata.internal_id.
 * 3. Fetch your stored pending order / paid order from DB.
 */
async function getOrderByInternalId(internalId: string) {
  console.log("[get-order-by-internal-id]", internalId);

  // TODO: fetch from DB.
  return null as
    | null
    | {
        orderId: string;
        pathId: string;
        pathTitle: string;
        sizeId: string;
        sizeLabel: string;
        clientName: string;
        customerEmail: string;
        projectAddress: string;
      };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id")?.trim();

    if (!sessionId) {
      throw new Error("session_id is required");
    }

    const session = await checkoutStatusStripe.checkout.sessions.retrieve(sessionId);

    const internalId =
      session.client_reference_id ?? session.metadata?.internal_id ?? "";

    if (!internalId) {
      throw new Error("Could not find internal order id on session");
    }

    const lineItems = await checkoutStatusStripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
    });

    const storedOrder = await getOrderByInternalId(internalId);

    return csJson({
      ok: true,
      paid: session.payment_status === "paid",
      status: session.status,
      paymentStatus: session.payment_status,
      sessionId: session.id,
      orderId: internalId,
      clientName: storedOrder?.clientName ?? session.metadata?.client_name ?? "",
      customerEmail: session.customer_details?.email ?? session.customer_email ?? "",
      projectAddress: storedOrder?.projectAddress ?? session.metadata?.project_address ?? "",
      pathId: storedOrder?.pathId ?? session.metadata?.path_id ?? "",
      pathTitle: storedOrder?.pathTitle ?? "Paid order",
      sizeId: storedOrder?.sizeId ?? session.metadata?.size_id ?? "",
      sizeLabel: storedOrder?.sizeLabel ?? "",
      items: lineItems.data.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount_total: item.amount_total,
        currency: item.currency,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return csJson({ ok: false, error: message }, { status: 400 });
  }
}

// =========================================================
// File: app/api/stripe-webhook/route.ts
// =========================================================

const webhookStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function whJson(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function markOrderPaid(input: {
  orderId: string;
  sessionId: string;
  paymentIntentId?: string | null;
  customerEmail?: string | null;
  projectAddress?: string | null;
}) {
  console.log("[mark-order-paid]", input);
  // TODO: update DB record from pending_payment -> paid
}

async function createProjectFolder(input: {
  orderId: string;
  customerEmail?: string | null;
  projectAddress?: string | null;
}) {
  console.log("[create-project-folder]", input);
  // TODO: call Make.com / Zapier / Drive API / your backend job queue
}

async function sendInternalPaidEmail(input: {
  orderId: string;
  customerEmail?: string | null;
  projectAddress?: string | null;
}) {
  console.log("[send-internal-paid-email]", input);
  // TODO: email yourself summary + links + next steps
}

async function sendClientPaidEmail(input: {
  orderId: string;
  customerEmail?: string | null;
  projectAddress?: string | null;
}) {
  console.log("[send-client-paid-email]", input);
  // TODO: email client with intake link + next steps + optional chat link
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    return whJson(
      { ok: false, error: "Missing STRIPE_WEBHOOK_SIGNING_SECRET" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return whJson({ ok: false, error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = webhookStripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    return whJson({ ok: false, error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId =
          session.client_reference_id ?? session.metadata?.internal_id ?? "";

        if (!orderId) {
          throw new Error("checkout.session.completed missing internal order id");
        }

        await markOrderPaid({
          orderId,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          projectAddress: session.metadata?.project_address ?? null,
        });

        await createProjectFolder({
          orderId,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          projectAddress: session.metadata?.project_address ?? null,
        });

        await sendInternalPaidEmail({
          orderId,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          projectAddress: session.metadata?.project_address ?? null,
        });

        await sendClientPaidEmail({
          orderId,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          projectAddress: session.metadata?.project_address ?? null,
        });

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId =
          session.client_reference_id ?? session.metadata?.internal_id ?? "";

        if (!orderId) break;

        await markOrderPaid({
          orderId,
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          projectAddress: session.metadata?.project_address ?? null,
        });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[checkout.session.expired]", {
          sessionId: session.id,
          orderId: session.client_reference_id ?? session.metadata?.internal_id,
        });
        break;
      }

      default: {
        console.log("[stripe-webhook:unhandled]", event.type);
      }
    }

    return whJson({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return whJson({ ok: false, error: message }, { status: 500 });
  }
}
