export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
  };

  try {
    const body = await request.json();

    if (body.botcheck) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields." }),
        { status: 400, headers }
      );
    }

    const TO = env.CONTACT_EMAIL || "info@leckconstruction.co";

    const emailBody = [
      `New enquiry from the Leck Construction website.`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${phone || "Not provided"}`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    const send = new Request("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: TO }] }],
        from: { email: "website@leckconstruction.co", name: "Leck Construction Website" },
        reply_to: { email, name },
        subject: `New Enquiry — ${name}`,
        content: [{ type: "text/plain", value: emailBody }],
      }),
    });

    const res = await fetch(send);

    if (res.status === 202 || res.status === 200) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    const err = await res.text();
    console.error("MailChannels error:", res.status, err);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send." }),
      { status: 502, headers }
    );
  } catch (e) {
    console.error("Contact handler error:", e);
    return new Response(
      JSON.stringify({ success: false, message: "Server error." }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
