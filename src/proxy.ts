import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde-fou léger (proxy Next 16, ex-middleware) : redirige vers la connexion
 * si aucun cookie de session n’est présent. La vérification réelle des droits
 * reste côté serveur (requireAdmin / requireClient), car le proxy s’exécute sur
 * l’edge et n’a donc accès ni à la base ni à src/lib/env.ts (server-only).
 */
const COOKIE = process.env.SESSION_COOKIE_NAME || "topeco_session";

export default function proxy(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(COOKIE)?.value);
  const { pathname, search } = req.nextUrl;

  if (!hasSession && pathname.startsWith("/mon-compte")) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "?next=" + encodeURIComponent(pathname + search);
    return NextResponse.redirect(url);
  }

  if (!hasSession && pathname.startsWith("/admin") && pathname !== "/admin/connexion") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  return res;
}

export const config = { matcher: ["/mon-compte/:path*", "/admin/:path*"] };
