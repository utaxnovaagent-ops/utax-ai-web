import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, authConfigured, verifySession } from "@/lib/auth";

// Saytga kirishni cheklaydi. Ilgari HTTP Basic Auth edi — u har yangi
// qurilmada brauzerning tizim oynasini chiqarardi va uni eslab qolmasdi.
// Endi: sessiya cookie'si bo'lmasa, /login sahifasiga yo'naltiriladi.
//
// Proxy Node.js runtime'da ishlaydi (Next.js 16 standarti), shu sabab
// node:crypto ishlatsa bo'ladi.

// Login sahifasi va uning API'si ochiq bo'lishi shart — aks holda kirish
// imkonsiz bo'lib qoladi.
const PUBLIC_PATHS = ["/login", "/api/login"];

// Saytning asosiy manzili. Eski Vercel deploy'i hamon tirik va GitHub'dan
// avtomatik yangilanadi, lekin u yerda ma'lumot ham, sozlama ham yo'q —
// eski havolani bosgan odam bo'sh xato sahifasiga tushmasligi uchun uni
// asosiy manzilga yo'naltiramiz.
const CANONICAL_HOST = process.env.CANONICAL_HOST ?? "utax-ai.169-58-178-40.sslip.io";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (host.endsWith(".vercel.app") && CANONICAL_HOST) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(target, 308);
  }

  // Sozlanmagan bo'lsa — "fail-open" (himoyasiz ochiq) qolib ketmasligi
  // uchun ataylab yopiq holatda qoldiramiz.
  if (!authConfigured()) {
    return new NextResponse(
      "Sayt himoyasi hali sozlanmagan (SITE_AUTH_PASSWORD yo'q). Administratorga murojaat qiling.",
      { status: 503 }
    );
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (verifySession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  // API so'rovlariga sahifa emas, aniq javob qaytaramiz
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, message: "Kirish talab qilinadi" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  // Kirgandan keyin foydalanuvchi qaytadan o'sha sahifaga tushsin
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Static asset/optimallashtirish yo'llari bundan mustasno — aks holda
  // login sahifasi uslubsiz ko'rinadi.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand).*)"],
};
