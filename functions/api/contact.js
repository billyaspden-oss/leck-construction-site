const ALLOWED_ORIGINS = [
  "https://leckconstruction.co.uk",
  "https://www.leckconstruction.co.uk",
  "https://leck-construction-site.billy-aspden.workers.dev",
];

function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
  };

  try {
    const body = await request.json();

    if (body.botcheck) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    const name    = stripHtml(body.name    || "").slice(0, 100);
    const email   = stripHtml(body.email   || "").slice(0, 254);
    const phone   = stripHtml(body.phone   || "").slice(0, 20);
    const message = stripHtml(body.message || "").slice(0, 2000);
    const type     = body.type;
    const interest = body.interest;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields." }),
        { status: 400, headers }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email address." }),
        { status: 400, headers }
      );
    }

    if (type !== "avon-wood" && !message) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields." }),
        { status: 400, headers }
      );
    }

    const TO = env.CONTACT_EMAIL || "info@leckconstruction.co";
    const RESEND_KEY = env.RESEND_API_KEY;

    if (!RESEND_KEY) {
      console.error("RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ success: false, message: "Email not configured." }),
        { status: 500, headers }
      );
    }

    const interestLabels = {
      any:   "Any — happy to hear about all releases",
      birch: "The Birch — 3-bed semi (from £285,000)",
      oak:   "The Oak — 4-bed detached (from £375,000)",
      cedar: "The Cedar — 4-bed + study (from £415,000)",
      larch: "The Larch — 5-bed executive (from £495,000)",
    };

    const subject = type === "avon-wood"
      ? `Avon Wood — Register Interest — ${name}`
      : `New Enquiry — ${name}`;

    const emailBody = type === "avon-wood"
      ? [
          `New Avon Wood register-interest submission.`,
          ``,
          `Name:     ${name}`,
          `Email:    ${email}`,
          `Phone:    ${phone || "Not provided"}`,
          `Interest: ${interestLabels[interest] || interest || "Not specified"}`,
          ``,
          `Additional notes:`,
          message || "None",
        ].join("\n")
      : [
          `New enquiry from the Leck Construction website.`,
          ``,
          `Name:    ${name}`,
          `Email:   ${email}`,
          `Phone:   ${phone || "Not provided"}`,
          ``,
          `Message:`,
          message,
        ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Leck Construction Website <website@leckconstruction.co.uk>",
        to: [TO],
        reply_to: email,
        subject,
        text: emailBody,
      }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    const err = await res.text();
    console.error("Resend error:", res.status, err);
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

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    },
  });
}
