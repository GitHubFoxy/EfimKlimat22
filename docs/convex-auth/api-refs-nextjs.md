API Reference
nextjs
nextjs
ConvexAuthNextjsProvider()

Replace your ConvexProvider in a Client Component with this component to enable authentication in your Next.js app.

"use client";
 
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
 
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
 
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}

Parameters
Parameter	Type	Description

props
	

object
	

‐

props.client
	

ConvexReactClient
	

Your ConvexReactClient

.

props.children
	

ReactNode
	

Children components can call Convex hooks and useAuthActions.
Returns

Element
Defined in

src/nextjs/index.tsx:33