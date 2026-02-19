import Stripe from "stripe";

export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const session_id = url.searchParams.get("session_id");

  if (!session_id) {
    return new Response("Missing session ID", { status: 400 });
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response("Payment not verified", { status: 403 });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Download Your Divorce Forms | InFormer</title>
  <style>
    body { font-family: sans-serif; background: #0b0f14; color: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .container { text-align: center; max-width: 480px; padding: 2rem; }
    h1 { color: #D4AF37; font-size: 1.5rem; margin-bottom: 1rem; }
    p { margin-bottom: 1.5rem; line-height: 1.6; }
    .download-btn { display: inline-block; padding: 14px 32px; background: #D4AF37; color: #0b0f14; font-weight: 700; font-size: 1rem; text-decoration: none; border-radius: 8px; }
    .download-btn:hover { background: #c9a430; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Payment Verified</h1>
    <p>Your payment has been confirmed. Click the button below to download your divorce forms.</p>
    <a href="https://informerlegal.com/files/uncontested-divorce-forms.pdf" class="download-btn">Download Forms</a>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response("Error verifying payment", { status: 500 });
  }
}
