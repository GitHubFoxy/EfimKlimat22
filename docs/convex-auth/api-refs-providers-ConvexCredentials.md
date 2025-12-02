API Reference
providers
ConvexCredentials
providers/ConvexCredentials

Configure ConvexCredentials provider given a ConvexCredentialsUserConfig.

This is for a very custom authentication implementation, often you can use the Password provider instead.

import ConvexCredentials from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth } from "@convex-dev/auth/server";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      authorize: async (credentials, ctx) => {
        // Your custom logic here...
      },
    }),
  ],
});

ConvexCredentialsUserConfig<DataModel>

The available options to a ConvexCredentials provider for Convex Auth.
Properties
id?

    optional id: string

Uniquely identifies the provider, allowing to use multiple different ConvexCredentials providers.
Defined in

src/providers/ConvexCredentials.ts:43
authorize()
Parameters
Parameter	Type	Description

credentials
	

Partial<Record<string, undefined | Value>>
	

The available keys are determined by your call to signIn() on the client.

You can add basic validation depending on your use case, or you can use a popular library like Zod

for validating the input.

ctx
	

GenericActionCtxWithAuthConfig<DataModel>
	

‐
Returns

Promise<null | object>

This method expects a user ID to be returned for a successful login. A session ID can be also returned and that session will be used. If an error is thrown or null is returned, the sign-in will fail.
Defined in

src/providers/ConvexCredentials.ts:52
crypto?

Provide hashing and verification functions if you're storing account secrets and want to control how they're hashed.

These functions will be called during the createAccount and retrieveAccount execution when the secret option is used.
hashSecret()

Function used to hash the secret.
Parameters
Parameter	Type

secret
	

string
Returns

Promise<string>
verifySecret()

Function used to verify that the secret matches the stored hash.
Parameters
Parameter	Type

secret
	

string

hash
	

string
Returns

Promise<boolean>
Defined in

src/providers/ConvexCredentials.ts:75
extraProviders?

Register extra providers used in the implementation of the credentials provider. They will only be available to the signInViaProvider function, and not to the signIn function exposed to clients.
Defined in

src/providers/ConvexCredentials.ts:91
ConvexCredentials()

The Credentials provider allows you to handle signing in with arbitrary credentials, such as a username and password, domain, or two factor authentication or hardware device (e.g. YubiKey U2F / FIDO).
Parameters
Parameter	Type

config
	

ConvexCredentialsUserConfig<DataModel>
Returns

ConvexCredentialsConfig
Defined in

src/providers/ConvexCredentials.ts:98