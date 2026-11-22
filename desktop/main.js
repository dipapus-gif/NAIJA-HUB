const { app, BrowserWindow, Menu, shell, nativeTheme } = require("electron");
const path = require("path");

// Set NAIJA_HUB_URL to override (e.g. http://localhost:3000 for development).
const APP_URL = process.env.NAIJA_HUB_URL || "https://naija-hub-nine.vercel.app";
const APP_ORIGIN = new URL(APP_URL).origin;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 420,
    minHeight: 600,
    backgroundColor: "#061A14",
    title: "Naija Hub",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });

  win.loadURL(APP_URL);
  // Offline-first: if the site can't load, show the local fallback and retry.
  win.webContents.on("did-fail-load", (_e, code, _d, _u, isMainFrame) => {
    if (!isMainFrame || code === -3) return;
    win.loadFile(path.join(__dirname, "offline.html"));
    setTimeout(() => win.loadURL(APP_URL), 15000);
  });

  // Keep the app on its own origin; open everything else in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (new URL(url).origin !== APP_ORIGIN) shell.openExternal(url);
    return { action: new URL(url).origin === APP_ORIGIN ? "allow" : "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (url.startsWith("file:")) return;
    if (new URL(url).origin !== APP_ORIGIN) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  nativeTheme.themeSource = "system";
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: "appMenu" },
      { role: "editMenu" },
      { label: "View", submenu: [{ role: "reload" }, { role: "togglefullscreen" }, { role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }] },
      { role: "windowMenu" },
    ])
  );
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
