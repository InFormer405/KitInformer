import Stripe from "stripe";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { priceId, state } = await request.json();

    if (!priceId || !state) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: priceId and state" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.BASE_URL}/success.html`,
      cancel_url: `${env.BASE_URL}/cancel.html`,
      metadata: {
        priceId,
        state,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Checkout session error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
