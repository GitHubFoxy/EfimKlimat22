API Reference
providers
Email
providers/Email

Simplifies creating custom email providers, such as for sending OTPs.
Email()

Email providers send a token to the user's email address for sign-in.

When you use this function to create your config, by default it checks that there is an email field during token verification that matches the email used during the initial signIn call.

If you want the "magic link behavior", where only the token is needed, you can override the authorize method to skip the check:

import Email from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({ authorize: undefined }),
  ],
});

Make sure the token has high enough entropy to be secure.
Parameters
Parameter	Type

config
	

EmailUserConfig<DataModel> & Pick<EmailConfig<GenericDataModel>, "sendVerificationRequest">
Returns

EmailConfig<DataModel>
Defined in

src/providers/Email.ts:34