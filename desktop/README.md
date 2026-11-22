# Naija Hub desktop app

A thin Electron shell around the deployed web app (same login, theme and co-pilot).

    cd desktop && npm install
    NAIJA_HUB_URL=https://your-site.vercel.app npm start      # run
    npm run dist                                              # build installer for the current OS

Installers for Windows, macOS and Linux are built by `.github/workflows/desktop.yml`
(push a tag like `desktop-v1.0.0`). Builds are unsigned: Windows SmartScreen and macOS Gatekeeper will warn until you add code-signing certificates.
