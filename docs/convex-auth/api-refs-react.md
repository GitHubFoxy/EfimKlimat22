API Reference
react
react

React bindings for Convex Auth.
useAuthActions()

Use this hook to access the signIn and signOut methods:

import { useAuthActions } from "@convex-dev/auth/react";
 
function SomeComponent() {
  const { signIn, signOut } = useAuthActions();
  // ...
}

Returns

ConvexAuthActionsContext
Defined in

src/react/index.tsx:33
ConvexAuthProvider()

Replace your ConvexProvider with this component to enable authentication.

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
 
const convex = new ConvexReactClient(/* ... */);
 
function RootComponent({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
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

props.storage?
	

TokenStorage
	

Optional custom storage object that implements the TokenStorage interface, otherwise localStorage

is used.

You must set this for React Native.

props.storageNamespace?
	

string
	

Optional namespace for keys used to store tokens. The keys determine whether the tokens are shared or not.

Any non-alphanumeric characters will be ignored (for RN compatibility).

Defaults to the deployment URL, as configured in the given client.

props.replaceURL?
	

(relativeUrl) => void | Promise<void>
	

Provide this function if you're using a JS router (Expo router etc.) and after OAuth or magic link sign-in the code param is not being erased from the URL.

The implementation will depend on your chosen router.

props.shouldHandleCode?
	

() => boolean
	

If this function returns false, the auth provider will not attempt to handle the code param from the URL.

props.children
	

ReactNode
	

Children components can call Convex hooks
Returns

Element
Defined in

src/react/index.tsx:52
TokenStorage

A storage interface for storing and retrieving tokens and other secrets.

In browsers localStorage and sessionStorage implement this interface.

sessionStorage can be used for creating separate sessions for each browser tab.

In React Native we recommend wrapping expo-secure-store.
Properties
getItem()

Read a value.
Parameters
Parameter	Type	Description

key
	

string
	

Unique key.
Returns

undefined | null | string | Promise<undefined | null | string>
Defined in

src/react/index.tsx:164
setItem()

Write a value.
Parameters
Parameter	Type	Description

key
	

string
	

Unique key.

value
	

string
	

The value to store.
Returns

void | Promise<void>
Defined in

src/react/index.tsx:172
removeItem()

Remove a value.
Parameters
Parameter	Type	Description

key
	

string
	

Unique key.
Returns

void | Promise<void>
Defined in

src/react/index.tsx:177
ConvexAuthActionsContext

The result of calling useAuthActions.
Type declaration
signIn()

Sign in via one of your configured authentication providers.
Parameters
Parameter	Type	Description

this
	

void
	

‐

provider
	

string
	

The ID of the provider (lowercase version of the provider name or a configured id option value).

params?
	

FormData | Record<string, Value> & object
	

Either a FormData object containing the sign-in parameters or a plain object containing them. The shape required depends on the chosen provider's implementation.

Special fields:

    redirectTo: If provided, customizes the destination the user is redirected to at the end of an OAuth flow or the magic link URL. See redirect callback.
    code: OTP code for email or phone verification, or (used only in RN) the code from an OAuth flow or magic link URL.

Returns

Promise<object>

Whether the user was immediately signed in (ie. the sign-in didn't trigger an additional step like email verification or OAuth signin).
signingIn

    signingIn: boolean

Whether the call led to an immediate successful sign-in.

Note that there's a delay between the signIn function returning and the client performing the handshake with the server to confirm the sign-in.
redirect?

    optional redirect: URL

If the sign-in started an OAuth flow, this is the URL the browser should be redirected to.

Useful in RN for opening the in-app browser to this URL.
signOut()

Sign out the current user.

Calls the server to invalidate the server session and deletes the locally stored JWT and refresh token.
Parameters
Parameter	Type

this
	

void
Returns

Promise<void>
Defined in

src/react/index.tsx:183
useAuthToken()

Use this hook to access the JWT token on the client, for authenticating your Convex HTTP actions.

You should not pass this token to other servers (think of it as an "ID token").

import { useAuthToken } from "@convex-dev/auth/react";
 
function SomeComponent() {
  const token = useAuthToken();
  const onClick = async () => {
    await fetch(`${CONVEX_SITE_URL}/someEndpoint`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  // ...
}

Returns

null | string
Defined in

src/react/index.tsx:276