export async function onRequestPost(context) {
  const { request } = context;

  try {
    const body = await request.text();
    const event = JSON.parse(body);

    console.log("Stripe event received:", event.type);

    // TODO: handle checkout.session.completed here later

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
