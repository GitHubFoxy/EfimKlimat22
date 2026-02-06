/* global module */
module.exports = {
  apps: [
    {
      name: 'klimat22-app',
      script: 'pnpm',
      args: 'exec next start -p 3000',
      env: { PORT: 3000, NODE_ENV: 'production' },
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
