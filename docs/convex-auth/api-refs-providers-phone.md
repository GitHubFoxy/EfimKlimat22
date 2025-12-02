API Reference
providers
Phone
providers/Phone

Configure Phone provider given a PhoneUserConfig.

Simplifies creating phone providers.

By default checks that there is an phone field during token verification that matches the phone used during the initial signIn call.
Phone()

Phone providers send a token to the user's phone number for sign-in.

When you use this function to create your config, it checks that there is a phone field during token verification that matches the phone used during the initial signIn call.
Parameters
Parameter	Type

config
	

PhoneUserConfig & Pick<PhoneConfig<GenericDataModel>, "sendVerificationRequest">
Returns

PhoneConfig<DataModel>
Defined in

src/providers/Phone.ts:23