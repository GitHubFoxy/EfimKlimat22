export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL ??
        process.env.CONVEX_SITE_ORIGIN ??
        'https://api.klimat22.com',
      applicationID: 'convex',
    },
  ],
}
