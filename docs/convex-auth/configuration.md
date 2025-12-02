Configuration
Configure Authentication Methods

Now you need to choose how you want your users to authenticate.

If you're just getting started for the first time, we recommend using GitHub OAuth. This is the simplest method to set up.

If you don't want to use any other service you can use Passwords without password recovery.

Eventually most apps support one or more OAuth providers (GitHub, Google, Apple etc.), and pair them with either email sign-in via Magic Link / OTP or with a traditional email + password combination with email verification.
example sign in forms

If you know which methods you want to support click on the links below and follow the method specific guide:

    Magic Links or OTPs (send a link or code via email)
    OAuth (sign in with Github / Google / Apple etc.)
    Passwords (including password reset flow and optional email verification)

Understand the tradeoffs

There are DX, UX and security tradeoffs between these methods, and you have to decide which method is right for your application. Read on to learn more about the tradeoffs.
OAuth

DX considerations:

    ❗️ OAuth requires configuring the OAuth provider, which sometimes requires controlling a web domain and might involve additional verification steps. The DX of the OAuth configuration is usually far from ideal.
    👍 OAuth providers carry the burden of correctly implementing other authentication methods and features: passwords, email verification, MFA, SSO, etc.

UX considerations:

    👍 OAuth is very user friendly because most users will already be signed in with the OAuth provider and only need to authorize your app.
    ❗️ OAuth requires the user to have an account with one of the OAuth providers you chose. If they don’t, and if they don’t want to create one, they will not be able to sign in via this method.

Security considerations:

    👍 OAuth security relies on the OAuth provider’s security, which is usually strong given the amount of resources the providers have.

Magic Links & OTPs

DX considerations:

    ❗️ Magic links & OTPs require configuring an email provider / server, which in turn requires controlling a web domain.
    👍 Magic links have the simplest implementation of all the methods.
    ⏱️ Currently we don't have a guide for using magic links with React Native.

UX considerations:

    ❗️ Magic links & OTPs require the user to access their email every time they want to sign in on a new device, after a previous sign out, or after their session expires.
    👍 Magic links & OTPs don’t require the user to come up with and remember a password or user having a password manager installed.
    ❗️ Magic links make it hard to sign in on a device where the user cannot easily access their email inbox.
    👍 OTPs make it easy to sign in on a device where the user cannot easily access their email inbox (compared to magic links).

Security considerations:

    ❗️ Magic links can be used for phishing: an attacker can send a genuine magic link that signs in the victim to the attacker’s account.
    ❗️ OTPs can be used for phishing: an attacker can induce your app to send a genuine OTP for the victim’s account to the victim’s email, and then get the code from the victim to complete the sign in as the victim.

Passwords

DX considerations:

    😐 Production-ready passwords implementation requires configuring an email provider / server for password recovery, which in turn requires controlling a web domain.
    ❗️ Passwords have the most complex implementation.

UX considerations:

    👍 Passwords are fairly user-friendly for users with password managers installed.
    ❗️ Passwords require users without password managers to come up with and remember a password.

Security considerations:

    ❗️ People are prone to reusing passwords which allows an attacker to use a password stolen from an insecure application or from a phishing attack.
    ❗️ Your application must not leak passwords in any way (such as through inadvertent logging during the authentication flow).
