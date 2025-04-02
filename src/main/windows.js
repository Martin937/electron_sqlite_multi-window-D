const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLog = require('electron-log');
const url = require('url');

class WindowManager {
	static windows = new Map();

	static createMainWindow() {
		const win = new BrowserWindow({
			width: 1200,
			height: 800,
			minWidth: 800,
			minHeight: 600,
			webPreferences: {
				preload: path.join(__dirname, '../renderer/preload.js'),
				sandbox: true,
				nodeIntegration: false,
				contextIsolation: true
			},
			icon: path.join(__dirname, '../../assets/icons/logotype_1.jpg')
		});

		const startUrl = url.format({
			pathname: path.join(__dirname, '../pages/dashboard/dashboard.html'),
			protocol: 'file:',
			slashes: true
		});

		win.loadURL(startUrl);

		// DevTools в development-режиме
		if (process.env.NODE_ENV === 'development') {
			win.webContents.openDevTools({
				mode: 'right', // Открытие справа
				activate: true,
				title: 'Developer Tools'
			});
		}

		win.on('closed', () => {
			this.windows.delete(win.id);
		});

		this.windows.set(win.id, win);
		electronLog.info(`Main window created (ID: ${win.id})`);

		return win;
	}

	static createWindow(pageName) {
		const validPages = ['dashboard', 'nutritionTable', 'cookbook', 'nutritionSchedule'];
		if (!validPages.includes(pageName)) {
			electronLog.error(`Attempt to open invalid page: ${pageName}`);
			return;
		}

		const win = new BrowserWindow({
			width: 1000,
			height: 700,
			webPreferences: {
				preload: path.join(__dirname, '../renderer/preload.js'),
				sandbox: true,
				nodeIntegration: false,
				contextIsolation: true
			}
		});

		const pageUrl = url.format({
			pathname: path.join(__dirname, `../pages/${pageName}/${pageName}.html`),
			protocol: 'file:',
			slashes: true
		});

		win.loadURL(pageUrl);
		this.windows.set(win.id, win);
		electronLog.info(`Window for ${pageName} created (ID: ${win.id})`);

		return win;
	}

	static applyThemeToAllWindows(theme) {
		this.windows.forEach(win => {
			win.webContents.send('theme-changed', theme);
		});
	}

	static setupIPCHandlers() {
		ipcMain.handle('create-window', (event, pageName) => {
			return this.createWindow(pageName);
		});
	}
}

module.exports = WindowManager;