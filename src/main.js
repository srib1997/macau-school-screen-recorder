const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')

const isWin = process.platform === ('win32' || 'win64')
let mainWindow
let pickerDialog

const desktop = path.join(os.homedir(), 'Desktop')
const floderName = '.macau-school'
const pathOfDownload = isWin ? `${desktop}\\${floderName}` : `${desktop}/${floderName}`

app.on('ready', () => {
  try {
    if (!fs.existsSync(pathOfDownload)) {
      fs.mkdir(pathOfDownload)
    }
  } catch (err) {
    console.log(err)
  }
  console.log(pathOfDownload)
  fs.readdirSync(pathOfDownload).forEach(file => {
    console.log(file)
  })

  mainWindow = new BrowserWindow({
    height: 500,
    width: 600
  })

  pickerDialog = new BrowserWindow({
    parent: mainWindow,
    skipTaskbar: true,
    modal: true,
    show: false,
    height: 390,
    width: 680
  })
  mainWindow.loadURL('file://' + __dirname + '/index.html')
  pickerDialog.loadURL('file://' + __dirname + '/picker.html')

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // 設定儲存路徑，不讓 Electron 跳出視窗詢問。
    item.setSavePath(isWin ? `${pathOfDownload}\\macau-school${'-' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + '-' + new Date().getMinutes()}.webm` : `${pathOfDownload}/macau-school${'-' + new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + '-' + new Date().getMinutes()}.webm`)

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('下載中斷，無法續傳')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('暫停下載')
        } else {
          console.log(`收到的位元組: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('下載完成')
      } else {
        console.log(`下載失敗: ${state}`)
      }
    })
  })
})

ipcMain.on('show-picker', (event, options) => {
  pickerDialog.show()
  pickerDialog.webContents.send('get-sources', options)
})

ipcMain.on('source-id-selected', (event, sourceId) => {
  console.log('sourceId: ', sourceId)
  pickerDialog.hide()
  mainWindow.webContents.send('source-id-selected', sourceId)
})
