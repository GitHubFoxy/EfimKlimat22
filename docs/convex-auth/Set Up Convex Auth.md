Set Up Convex Auth
Creating a new project

NOTE: Convex Auth support for Next.js with server-side authentication (SSA) is experimental.

To start a new project from scratch with Convex and Convex Auth, run

npm create convex@latest

and choose Next.js and then Convex Auth.

This guide assumes you already have a working Convex app from following the instructions above.
Install the NPM library

npm install @convex-dev/auth @auth/core@0.37.0

This also installs @auth/core, which you will use during provider configuration later.
Run the initialization command

npx @convex-dev/auth

This sets up your project for authenticating via the library.

Alternatively you can perform these steps manually: Manual Setup
Add authentication tables to your schema

Convex Auth assumes you have several tables set up with specific indexes.

You can add these tables to your schema

via the authTables export:
convex/schema.ts

import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
 
const schema = defineSchema({
  ...authTables,
  // Your other tables...
});
 
export default schema;

Set up the React provider

Convex Auth has support for both App Router and Pages Router without any server-side authentication (SSA).

There is experimental support for SSA on the Next.js server with App Router. SSA with the Pages Router is currently unsupported.

Replace ConvexProvider from convex/react with ConvexAuthProvider from @convex-dev/auth/react:
app/ConvexClientProvider.tsx

App router without SSA

"use client";
 
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
 
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
 
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}

Note that the React examples in this documentation are all Client Components unless noted otherwise, so you might need to add "use client" to their source.

The initial setup is done. Next you'll choose and configure authentication methods.