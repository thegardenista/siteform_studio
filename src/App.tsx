import Stripe from "stripe";

/**
 * Next.js App Router serverless route
 * File path for GitHub repo:
 *   app/api/create-checkout-session/route.ts
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY=sk_live_or_test_...
 *   APP_BASE_URL=https://your-domain.com
 *
 * Optional env vars:
 *   TERMS_URL=https://your-domain.com/terms
 *   BUSINESS_EMAIL=you@example.com
 *
 * What this route does:
 * 1. Receives selected services + customer info from React.
 * 2. Saves the full long notes outside Stripe as a pending order draft.
 * 3. Sends only short metadata into Stripe Checkout.
 * 4. Creates a Checkout Session with:
 *    - success_url containing {CHECKOUT_SESSION_ID}
 *    - consent_collection.terms_of_service = required
 *    - invoice_creation.enabled = true
 *    - invoice footer / custom fields
 * 5. Returns { url } for redirect.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

type CheckoutItem = {
  stripe_price_id: string;
  quantity: number;
  title: string;
};

type CheckoutRequest = {
  customer_email: string;
  client_name: string;
  project_address: string;
  path_id: string;
  size_id: string;
  items: CheckoutItem[];
  metadata: {
    internal_id: string;
    project_address: string;
    short_notes?: string;
  };
  full_notes?: string;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function sanitizeNotes(notes?: string): string {
  if (!notes) return "";
  return notes.replace(/\s+/g, " ").trim();
}

function shortNotes(notes?: string, max = 250): string {
  const clean = sanitizeNotes(notes);
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function validatePayload(payload: CheckoutRequest) {
  if (!payload.customer_email?.trim()) {
    throw new Error("customer_email is required");
  }

  if (!payload.client_name?.trim()) {
    throw new Error("client_name is required");
  }

  if (!payload.metadata?.internal_id?.trim()) {
    throw new Error("metadata.internal_id is required");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("At least one payable item is required");
  }

  for (const item of payload.items) {
    if (!item.stripe_price_id?.trim()) {
      throw new Error("Every item must include stripe_price_id");
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Every item must have quantity >= 1");
    }
  }
}

/**
 * Replace this with your real persistence layer.
 * Examples:
 * - Supabase / Postgres
 * - DynamoDB
 * - Firestore
 * - Airtable
 * - Google Sheets via Make.com/Zapier
 */
async function savePendingOrderDraft(input: {
  orderId: string;
  customerEmail: string;
  clientName: string;
  projectAddress: string;
  pathId: string;
  sizeId: string;
  fullNotes: string;
  shortNotes: string;
  items: CheckoutItem[];
}) {
  console.log("[pending-order-draft]", input);
  // TODO: store full order before payment
}

export async function POST(req: Request) {
  try {
    const appBaseUrl = getEnv("APP_BASE_URL");
    const termsUrl = process.env.TERMS_URL ?? `${appBaseUrl}/terms`;

    const payload = (await req.json()) as CheckoutRequest;
    validatePayload(payload);

    const orderId = payload.metadata.internal_id.trim();
    const fullNotes = sanitizeNotes(payload.full_notes);
    const short = shortNotes(payload.full_notes || payload.metadata.short_notes);

    await savePendingOrderDraft({
      orderId,
      customerEmail: payload.customer_email.trim(),
      clientName: payload.client_name.trim(),
      projectAddress: payload.project_address.trim(),
      pathId: payload.path_id.trim(),
      sizeId: payload.size_id.trim(),
      fullNotes,
      shortNotes: short,
      items: payload.items,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.customer_email.trim(),
      client_reference_id: orderId,
      line_items: payload.items.map((item) => ({
        price: item.stripe_price_id,
        quantity: item.quantity,
      })),
      success_url: `${appBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/checkout-cancelled?order_id=${encodeURIComponent(orderId)}`,

      metadata: {
        internal_id: orderId,
        client_name: payload.client_name.trim(),
        path_id: payload.path_id.trim(),
        size_id: payload.size_id.trim(),
        project_address: payload.project_address.trim(),
        short_notes: short,
      },

      consent_collection: {
        terms_of_service: "required",
      },

      custom_text: {
        terms_of_service_acceptance: {
          message: `By paying, you agree to the Terms & Rules: ${termsUrl}`,
        },
        submit: {
          message:
            "After payment, you will return to the intake page to upload photos, survey PDFs, and the full project brief.",
        },
      },

      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Landscape service order ${orderId}`,
          footer: `By paying this invoice, you agree to our Terms & Rules: ${termsUrl}`,
          metadata: {
            internal_id: orderId,
            project_address: payload.project_address.trim(),
          },
          custom_fields: [
            {
              name: "Order ID",
              value: orderId.slice(0, 40),
            },
            {
              name: "Project Address",
              value: payload.project_address.trim().slice(0, 140),
            },
          ],
        },
      },

      phone_number_collection: {
        enabled: true,
      },

      billing_address_collection: "auto",

      automatic_tax: {
        enabled: true,
      },

      allow_promotion_codes: false,
    });

    return json({
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[create-checkout-session]", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }
}
