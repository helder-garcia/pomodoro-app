import { BrowserWindow, ipcMain } from "electron";
import createMenu from "./menu";
import path from 'path';
import * as url from 'url';

export default {
    createTimer: (windowProps?: Electron.BrowserWindowConstructorOptions, timerParams?: { maxTime?: number; time?: number; }) => {
        const window = new BrowserWindow({
            width: 400,
            height: 500,
            backgroundColor: '#1A1A29',
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            },
            movable: true,
            resizable: true,
            maximizable: false,
            minimizable: false,
            titleBarStyle: 'hiddenInset',
            alwaysOnTop: true,
            fullscreenable: false,
            frame: process.platform === 'darwin',
            transparent: process.platform === 'darwin',
            acceptFirstMouse: true,
            ...windowProps
        })

        if (timerParams?.time) {
            const handleAppReady = () => {
                window.webContents.send('create-timer', timerParams?.time, timerParams?.maxTime);
                ipcMain.removeListener('clock-ready', handleAppReady);
            }

            ipcMain.addListener('clock-ready', handleAppReady);
        }

        if (process.env.NODE_ENV === 'development') {
            window.loadURL('http://localhost:4000')
        } else {
            window.loadURL(
                url.format({
                    pathname: path.join(__dirname, 'renderer/index.html'),
                    protocol: 'file:',
                    slashes: true
                })
            )
        }

        createMenu();

        return window;
    }
}