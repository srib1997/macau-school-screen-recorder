
const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const url = require('url')

const isWin = process.platform === ('win32' || 'win64')
let mainWindow
let pickerDialog
let otherBrowserDialog

const desktop = path.join(os.homedir(), 'Desktop')
const floderName = '.macau-school'
const pathOfDownload = isWin ? `${desktop}\\${floderName}` : `${desktop}/${floderName}`

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

function createBrowser () {
  otherBrowserDialog = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }

  })

  // otherBrowserDialog.loadFile('file://' + __dirname + '/otherbrowser.html')
  otherBrowserDialog.loadURL(url.format({
    pathname: path.join(__dirname, 'otherbrowser.html'),
    protocol: 'file:',
    slashes: true
  }))
  // otherBrowserDialog.loadURL('https://macau.school')
  // const contents = otherBrowserDialog.webContents
  // console.log(contents)
  // otherBrowserDialog.on('closed', function () {
  //   // Dereference the window object, usually you would store windows
  //   // in an array if your app supports multi windows, this is the time
  //   // when you should delete the corresponding element.
  //   otherBrowserDialog = null
  // })
}

app.on('ready', () => {
  try {
    if (!fs.existsSync(pathOfDownload)) {
      fs.mkdir(pathOfDownload)
    }
  } catch (err) {
    console.log(err)
  }

  fs.readdirSync(pathOfDownload).forEach(file => {
    console.log(file)
  })

  mainWindow = new BrowserWindow({
    height: 500,
    width: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  pickerDialog = new BrowserWindow({
    parent: mainWindow,
    skipTaskbar: true,
    modal: true,
    show: false,
    height: 390,
    width: 680,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL('file://' + __dirname + '/index.html')
  pickerDialog.loadURL('file://' + __dirname + '/picker.html')
  // otherBrowserDialog.loadURL('file://' + __dirname + '/otherbrowser.html')

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

ipcMain.on('show-browser', (event, options) => {
  createBrowser()
})

ipcMain.on('source-id-selected', (event, sourceId) => {
  console.log('sourceId: ', sourceId)
  pickerDialog.hide()
  mainWindow.webContents.send('source-id-selected', sourceId)
})

// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (otherBrowserDialog === null) {
//     createBrowser()
//   }
// })
process.on('uncaughtException', function (error) {
  // Handle the error
  console.log(error)
})
