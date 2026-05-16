// Edge Function: get-profile-photo
// Carrega uma foto de perfil do bucket privado `avatars` (via URL assinada de 1h)
// e aplica uma marca d'água com o nome de quem está visualizando, retornando a
// imagem modificada (PNG).
//
// Observação: Sharp depende de binários nativos e NÃO funciona no runtime Deno
// do Supabase Edge. Usamos `imagescript` (puro JS/WebAssembly) — mesmo resultado
// para o caso de uso de marca d'água.

import { createClient } from "npm:@supabase/supabase-js@2";
import { Image, decode } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Font cache (cold-start once)
let fontCache: Uint8Array | null = null;
async function getFont(): Promise<Uint8Array> {
  if (fontCache) return fontCache;
  const url =
    "https://raw.githubusercontent.com/google/fonts/main/apache/roboto/static/Roboto-Bold.ttf";
  const res = await fetch(url);
  fontCache = new Uint8Array(await res.arrayBuffer());
  return fontCache;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path || path.includes("..")) {
      return new Response(JSON.stringify({ error: "invalid path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify viewer
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await authClient
      .from("profiles")
      .select("name, username")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    const watermark =
      profile?.username ||
      profile?.name ||
      userData.user.email?.split("@")[0] ||
      "usuário";

    // Download image via 1h signed URL using service role
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: signed, error: signErr } = await admin.storage
      .from("avatars")
      .createSignedUrl(path, 3600);
    if (signErr || !signed) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const imgRes = await fetch(signed.signedUrl);
    if (!imgRes.ok) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());

    // Decode + watermark
    const image = (await decode(imgBytes)) as Image;
    const font = await getFont();
    const fontSize = Math.max(14, Math.floor(image.height * 0.07));
    const text = `@${watermark}`;

    // Drop shadow (dark) and main text (white, semi-transparent)
    const shadow = Image.renderText(font, fontSize, text, 0x000000bb);
    const fg = Image.renderText(font, fontSize, text, 0xffffffd9);

    const tx = Math.max(0, Math.floor((image.width - fg.width) / 2));
    const ty = Math.max(0, image.height - fg.height - Math.floor(image.height * 0.04));

    // Semi-transparent band behind text for readability
    const bandH = fg.height + Math.floor(fontSize * 0.6);
    const bandY = Math.max(0, image.height - bandH);
    const band = new Image(image.width, bandH).fill(
      Image.rgbaToColor(0, 0, 0, 90),
    );
    image.composite(band, 0, bandY);

    image.composite(shadow, tx + 1, ty + 1);
    image.composite(fg, tx, ty);

    const out = await image.encode();

    return new Response(out, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("get-profile-photo error", err);
    return new Response(
      JSON.stringify({ error: "internal", detail: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
