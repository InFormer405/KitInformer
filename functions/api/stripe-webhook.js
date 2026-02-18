export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.text();
    const event = JSON.parse(body);

    console.log("Stripe event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerEmail = session.customer_details?.email;

      if (!customerEmail) {
        console.log("No customer email found.");
        return new Response("No email", { status: 200 });
      }

      // TODO: Replace with your actual product URL
      const downloadLink = "https://informerlegal.com/downloads/divorce-kit.pdf";

      console.log(`Send this link to: ${customerEmail}`);
      console.log(`Download link: ${downloadLink}`);

      // For now just log it.
      // Next step we wire email sending.

    }

    return new Response("Webhook received", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}