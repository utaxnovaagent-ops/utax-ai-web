import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Butun saytni HTTP Basic Auth bilan yopadi — repo PUBLIC va login sahifasi
// hali demo (parolni tekshirmaydi), shu sabab haqiqiy chegara shu yerda.
// Login/parol Vercel'da Environment Variables orqali sozlanadi, kodga
// yozilmaydi (SITE_AUTH_USER / SITE_AUTH_PASSWORD).
//
// Proxy Node.js runtime'da ishlaydi (Next.js 16 standarti), shu sabab
// node:crypto va Buffer bemalol ishlatiladi.

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Uzunligi boshqacha bo'lsa timingSafeEqual xato beradi — avval solishtirib,
  // keyin ham (uzunlik oqib ketmasligi uchun) doim bir xil uzunlikdagi
  // buferlarni solishtiramiz.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function proxy(request: NextRequest) {
  const expectedUser = process.env.SITE_AUTH_USER;
  const expectedPass = process.env.SITE_AUTH_PASSWORD;

  // Sozlanmagan bo'lsa — "fail-open" (himoyasiz ochiq) qolib ketmasligi
  // uchun ataylab yopiq holatda qoldiramiz.
  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Sayt himoyasi hali sozlanmagan (SITE_AUTH_USER / SITE_AUTH_PASSWORD yo'q). Administratorga murojaat qiling.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const sepIndex = decoded.indexOf(":");
    const suppliedUser = sepIndex === -1 ? decoded : decoded.slice(0, sepIndex);
    const suppliedPass = sepIndex === -1 ? "" : decoded.slice(sepIndex + 1);

    if (safeEqual(suppliedUser, expectedUser) && safeEqual(suppliedPass, expectedPass)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Kirish taqiqlangan.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="UTAX AI", charset="UTF-8"' },
  });
}

export const config = {
  // Static asset/optimallashtirish yo'llari bundan mustasno — aks holda
  // login qutisi chiqmasdan turib CSS/JS/rasm yuklanmay qoladi.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
