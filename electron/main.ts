import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'fs/promises';
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  
  win = new BrowserWindow({
    

    width: 1200,
    height: 1000,
    icon: path.join(process.env.VITE_PUBLIC, 'taqnialogo.jpg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  win.setMenuBarVisibility(false)
  win.maximize()
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
}
ipcMain.handle('load-pdf', async (_event, pdfPath) => {
  try {
    const data = await fs.readFile(pdfPath);
    return data.buffer; // Convert the Buffer to ArrayBuffer to send via IPC
  } catch (error) {
    console.error('Failed to read PDF file', error);
    throw error; // Rethrow error to handle it in renderer process
  }
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

ipcMain.handle('show-no-pages-selected-dialog', async () => {
  const response = await dialog.showMessageBox({
    type: 'warning',
    title: 'No Pages Selected',
    message: 'اختار صفحه',
    buttons: ['OK']
  });
  return response;
});
ipcMain.on('save-merged-pdf', async (_event, mergedPdfBuffer) => {
  try {
      // Show a dialog to choose the save location
      const { filePath } = await dialog.showSaveDialog({
          title: 'Save PDF',
          defaultPath: 'splitPDF.pdf',
          filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (!filePath) {
          // User canceled the save dialog
          return;
      }

      // Write the merged PDF buffer to the selected file path
      await fs.writeFile(filePath, mergedPdfBuffer);

      // Optionally, you can show a success message to the user
      dialog.showMessageBox({
          type: 'info',
          message: 'PDF Saved Successfully',
      });
  } catch (error:any) {
      // Handle any errors that may occur during the save process
      dialog.showErrorBox('Error Saving PDF', error.message);
  }
});
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
