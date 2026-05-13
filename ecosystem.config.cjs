// PM2 process file — used on the server after deploy.
// From app directory:  pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "northrail-planner",
      script: "npm",
      args: "start",
      cwd: ".",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
