export async function onRequestPost(context) {
  const { request, env } = context;

  const event = await request.json();

  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  const session = event.data.object;

  const email = session.customer_details?.email;

  const priceId =
    session.metadata?.priceId ||
    session.line_items?.data?.[0]?.price?.id ||
    null;

  if (!email || !priceId) {
    return new Response("Missing data", { status: 400 });
  }

  await fetch(env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      priceId
    })
  });

  return new Response("Success", { status: 200 });
}