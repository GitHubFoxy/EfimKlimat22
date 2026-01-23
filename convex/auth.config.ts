export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_SITE_URL,
      applicationID: 'convex',
    },
  ],
}
