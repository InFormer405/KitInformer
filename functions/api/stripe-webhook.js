import crypto from "crypto";

export async function onRequestPost(context) {
  const { request, env } = context;

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  const expectedSig = crypto
    .createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("hex");

  if (!signature || !signature.includes(expectedSig)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object;

  const email = session.customer_details?.email || null;

  const priceId =
    session.metadata?.priceId ||
    null;

  const state =
    session.metadata?.state ||
    null;

  if (!email || !priceId || !state) {
    return new Response("Missing data", { status: 400 });
  }

  await fetch(env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      priceId,
      state
    })
  });

  return new Response("Success", { status: 200 });
}