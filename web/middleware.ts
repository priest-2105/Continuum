export { auth as middleware } from "@/auth";

export const config = {
  // Protect all /admin routes except the login page itself
  matcher: ["/admin/((?!login$|login/).*)"],
};
