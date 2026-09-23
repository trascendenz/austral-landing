import { Hono } from "hono";
import {
  getCookie,
  setCookie
} from "hono/cookie";


type Bindings = {
  DB: D1Database;
};


type Campaign = {
  id: string;
  slug: string;
  destination_url: string;
};


const app = new Hono<{
  Bindings: Bindings;
}>();


app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "austral-tracker"
  });
});

app.get("/api/debug-geo", (c) => {
  const request = c.req.raw as CloudflareRequest;

  return c.json({
    cf: request.cf,
    country: request.cf?.country ?? null
  });
});

app.get("/r/:slug", async (c) => {

  const slug = c.req.param("slug");

  const country =
    request.cf?.country ?? null;

  /*
   * 1. Buscamos la campaña.
   *
   * IMPORTANTE:
   * usamos prepared statement, nunca concatenamos slug al SQL.
   */
  const campaign =
    await c.env.austral_tracking
      .prepare(`
        SELECT
          id,
          slug,
          destination_url
        FROM campaigns
        WHERE slug = ?1
          AND is_active = 1
        LIMIT 1
      `)
      .bind(slug)
      .first<Campaign>();


  if (!campaign) {
    return c.text(
      "Campaign not found",
      404
    );
  }


  /*
   * 2. Visitor ID first-party.
   *
   * No necesitamos guardar IP.
   */
  let visitorId =
    getCookie(c, "ac_vid");


  if (!visitorId) {

    visitorId =
      crypto.randomUUID();

    const url =
      new URL(c.req.url);

    setCookie(
      c,
      "ac_vid",
      visitorId,
      {
        httpOnly: true,
        sameSite: "Lax",

        secure:
          url.protocol === "https:",

        maxAge:
          60 * 60 * 24 * 365,

        path: "/"
      }
    );
  }


  /*
   * También recordamos cuál fue
   * la última campaña.
   */
  setCookie(
    c,
    "ac_campaign",
    campaign.slug,
    {
      httpOnly: true,
      sameSite: "Lax",

      secure:
        new URL(c.req.url)
          .protocol === "https:",

      maxAge:
        60 * 60 * 24 * 30,

      path: "/"
    }
  );


  /*
   * 3. Registramos UN EVENTO.
   *
   * No tocamos ningún contador compartido.
   */
  try {

    await c.env.austral_tracking
      .prepare(`
        INSERT INTO events (
          id,
          campaign_id,
          kind,
          visitor_id,
          referrer,
          user_agent,
          country
        )
        VALUES (
          ?1,
          ?2,
          'click',
          ?3,
          ?4,
          ?5,
          ?6
        )
      `)
      .bind(
        crypto.randomUUID(),
        campaign.id,
        visitorId,
        c.req.header("referer") ?? null,
        c.req.header("user-agent") ?? null,
        country
      )
      .run();

  } catch (error) {

    /*
     * Tracking nunca debería romper
     * el viaje del usuario.
     */
    console.error(
      "Failed to track click",
      error
    );
  }


  /*
   * Pase lo que pase con analytics,
   * mandamos al usuario al destino.
   */
  return c.redirect(
    campaign.destination_url,
    302
  );
});


export default app;