module.exports = {
  apps: [
    {
      name: "next-app-1",
      script: "pnpm",
      args: "start",
      env: { PORT: 3000, NODE_ENV: "production" },
      instances: 1,
      exec_mode: "fork"
    },
    {
      name: "next-app-2",
      script: "pnpm",
      args: "start",
      env: { PORT: 3001, NODE_ENV: "production" },
      instances: 1,
      exec_mode: "fork"
    }
  ]
}
