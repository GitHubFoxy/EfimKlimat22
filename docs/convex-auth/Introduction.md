
# Introduction

Convex Auth

Convex Auth is a library for implementing authentication directly within your Convex

backend. This allows you to authenticate users without needing an authentication service or even a hosting server. Your application can be:

    a React SPA served from a CDN
    a full-stack Next.js app
    a React Native mobile app

NOTE: Convex Auth is in beta. Please share any feedback you have on Discord

.

Convex Auth enables you to implement the following authentication methods:

    Magic Links & OTPs - send a link or code via email
    OAuth - sign in with Github / Google / Apple etc.
    Passwords - including password reset flow and optional email verification

To get a working authentication system, you'll follow these 3 steps:

    Set up the library
    Configure chosen authentication methods
    Build your UI

The library doesn't come with UI components, but you can copy from the example repo to quickly build a UI in React.

