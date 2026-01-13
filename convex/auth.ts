import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

function normalizePhone(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/^\+7/, "8");
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: "phone",
      profile(params) {
        const rawPhone = (params.phone as string) || "";
        const phone = normalizePhone(rawPhone);
        return {
          phone,
          email: phone, // Password provider uses email as account ID
        };
      },
    }),
  ],
});

export { normalizePhone };
