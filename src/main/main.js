const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLog = require('electron-log');
const WindowManager = require('./windows');
const { initDatabase } = require('../database/database');

// Конфигурация логов
electronLog.initialize({ preload: true });
electronLog.info('Application starting...');

// Глобальный обработчик ошибок
process.on('uncaughtException', (error) => {
	electronLog.error(`Uncaught Exception: ${error.stack}`);
});

let mainWindow;

app.whenReady().then(() => {
	// Инициализация БД
	// initDatabase().catch(err => {
	// 	electronLog.error(`Database init failed: ${err.message}`);
	// });
	WindowManager.setupIPCHandlers();
	// Создание главного окна
	mainWindow = WindowManager.createMainWindow();

	// Логирование из DevTools
	mainWindow.webContents.on('console-message', (event, level, message) => {
		electronLog.info(`Renderer Console: ${message}`);
	});

	ipcMain.on('renderer-error', (event, error) => {
		electronLog.error(`Renderer error: ${error}`);
	});

	// Обработчик для переключения тем
	ipcMain.handle('switch-theme', (event, theme) => {
		WindowManager.applyThemeToAllWindows(theme);
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = WindowManager.createMainWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// Экспорт для тестов
if (process.env.NODE_ENV === 'test') {
	module.exports = { app, WindowManager };
}

electronLog.info('Preload path:', path.join(__dirname, '../renderer/preload.js'));