// pm2 Ecosystem — MAGALOKO alle Prozesse
// Starten: pm2 start ecosystem.config.cjs
// Stoppen: pm2 stop all

module.exports = {
  apps: [
    {
      name: "magaloko-server",
      script: "server.mjs",
      cwd: "F:\\JTL_Export\\JTL_Export\\magaloko",
      interpreter: "node",
      env: { PORT: "4177", HOST: "127.0.0.1" }
    },
    {
      name: "magaloko-bot",
      script: "telegram-bot.mjs",
      cwd: "F:\\JTL_Export\\JTL_Export\\magaloko",
      interpreter: "node"
    },
    {
      name: "magaloko-ngrok",
      script: "C:\\Users\\Mo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\\ngrok.exe",
      args: "http --url=relapse-cactus-almanac.ngrok-free.dev 4177",
      interpreter: "none",
      autorestart: true
    }
  ]
};
