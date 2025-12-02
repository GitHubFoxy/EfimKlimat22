API Reference
providers
Anonymous
providers/Anonymous

Configure Anonymous provider given an AnonymousConfig.

import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { convexAuth } from "@convex-dev/auth/server";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous],
});

AnonymousConfig<DataModel>

The available options to an Anonymous provider for Convex Auth.
Properties
id?

    optional id: string

Uniquely identifies the provider, allowing to use multiple different Anonymous providers.
Defined in

src/providers/Anonymous.ts:36
profile()?

Perform checks on provided params and customize the user information stored after sign in.
Parameters
Parameter	Type	Description

params
	

Record<string, undefined | Value>
	

The values passed to the signIn function.

ctx
	

GenericActionCtxWithAuthConfig<DataModel>
	

Convex ActionCtx in case you want to read from or write to the database.
Returns

WithoutSystemFields<DocumentByName<DataModel, "users">> & object
Defined in

src/providers/Anonymous.ts:41
Anonymous()

An anonymous authentication provider.

This provider doesn't require any user-provided information.
Parameters
Parameter	Type

config
	

AnonymousConfig<DataModel>
Returns

ConvexCredentialsConfig
Defined in

src/providers/Anonymous.ts:61