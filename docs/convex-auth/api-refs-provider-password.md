API Reference
providers
Password
providers/Password

Configure Password provider given a PasswordConfig.

The Password provider supports the following flows, determined by the flow parameter:

    "signUp": Create a new account with a password.
    "signIn": Sign in with an existing account and password.
    "reset": Request a password reset.
    "reset-verification": Verify a password reset code and change password.
    "email-verification": If email verification is enabled and code is included in params, verify an OTP.

import Password from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

PasswordConfig<DataModel>

The available options to a Password provider for Convex Auth.
Properties
id?

    optional id: string

Uniquely identifies the provider, allowing to use multiple different Password providers.
Defined in

src/providers/Password.ts:56
profile()?

Perform checks on provided params and customize the user information stored after sign up, including email normalization.

Called for every flow ("signUp", "signIn", "reset", "reset-verification" and "email-verification").
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

src/providers/Password.ts:64
validatePasswordRequirements()?

Performs custom validation on password provided during sign up or reset.

Otherwise the default validation is used (password is not empty and at least 8 characters in length).

If the provided password is invalid, implementations must throw an Error.
Parameters
Parameter	Type	Description

password
	

string
	

the password supplied during "signUp" or "reset-verification" flows.
Returns

void
Defined in

src/providers/Password.ts:88
crypto?

Provide hashing and verification functions if you want to control how passwords are hashed.
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

src/providers/Password.ts:93
reset?

An Auth.js email provider used to require verification before password reset.
Defined in

src/providers/Password.ts:98
verify?

An Auth.js email provider used to require verification before sign up / sign in.
Defined in

src/providers/Password.ts:103
Password()

Email and password authentication provider.

Passwords are by default hashed using Scrypt from Lucia. You can customize the hashing via the crypto option.

Email verification is not required unless you pass an email provider to the verify option.
Parameters
Parameter	Type

config
	

PasswordConfig<DataModel>
Returns

ConvexCredentialsConfig
Defined in

src/providers/Password.ts:115