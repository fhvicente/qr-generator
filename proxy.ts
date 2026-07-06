import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Proxy de i18n (Next 16 renomeou "middleware" → "proxy"):
// deteta idioma e reescreve para /<locale>/...
export default createMiddleware(routing);

export const config = {
  // aplica a tudo exceto ficheiros estáticos, API e internos do Next
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
