Manual Setup

If you don't want the npx @convex-dev/auth command to make these changes for you, follow these steps after you've installed the library.

For code changes you can also refer to the example repo

.
Configure SITE_URL

The SITE_URL environment variable is used when redirecting back to your site during OAuth sign-in and for magic links sent via email.

You don't need to configure this variable if you're only using passwords.

Setting environment variables Convex docs

.

For local development you can run (adjust the port number as needed!):
npx convex env set SITE_URL http://localhost:3000

Configure private and public key

Run the following script via node generateKeys.mjs:
generateKeys.mjs

import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
 
const keys = await generateKeyPair("RS256", {
  extractable: true,
});
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
 
process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"`,
);
process.stdout.write("\n");
process.stdout.write(`JWKS=${jwks}`);
process.stdout.write("\n");

Copy the whole output and paste it into your Convex dashboard deployment's Environment Variables

page.

You should now have two variables set up: JWT_PRIVATE_KEY and JWKS (in addition to SITE_URL).
Modify tsconfig.json
convex/tsconfig.json

+    "skipLibCheck": true,
+    "moduleResolution": "Bundler",
-    "moduleResolution": "Node",

You might need to add "skipLibCheck": true to your project-level tsconfig.json as well.
Configure auth.config.ts
convex/auth.config.ts

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

Initialize auth.ts
convex/auth.ts

import { convexAuth } from "@convex-dev/auth/server";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [],
});

Configure http.ts
convex/http.ts

import { httpRouter } from "convex/server";
import { auth } from "./auth";
 
const http = httpRouter();
 
auth.addHttpRoutes(http);
 
export default http;