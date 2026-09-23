import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "austral-tracker"
  });
});

app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Austral Collective"
  });
});

/**
 * Después acá vamos a guardar el click
 * y redirigir al destino real.
 */
app.get("/r/:campaign", (c) => {
  const campaign = c.req.param("campaign");

  console.log("Campaign click:", campaign);

  return c.redirect(
    "https://australcollective.co",
    302
  );
});

export default app;