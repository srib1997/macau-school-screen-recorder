// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var ById = function (id) {
  return document.getElementById(id)
}
var jsonfile = require('jsonfile')
var favicon = require('favicon-getter').default
var path = require('path')
var uuid = require('uuid')
var bookmarks = path.join(__dirname, 'bookmarks.json')

var back = ById('back')
var forward = ById('forward')
var refresh = ById('refresh')
var omni = ById('url')
var dev = ById('console')
var fave = ById('fave')
var list = ById('list')
var popup = ById('fave-popup')
var view = ById('view')

function reloadView () {
  view.reload()
}

function backView () {
  view.goBack()
}

function forwardView () {
  view.goForward()
}

function updateURL (event) {
  if (event.keyCode === 13) {
    omni.blur()
    const val = omni.value
    const https = val.slice(0, 8).toLowerCase()
    const http = val.slice(0, 7).toLowerCase()
    if (https === 'https://') {
      view.loadURL(val)
    } else if (http === 'http://') {
      view.loadURL(val)
    } else {
      view.loadURL('http://' + val)
    }
  }
}

var Bookmark = function (id, url, faviconUrl, title) {
  this.id = id
  this.url = url
  this.icon = faviconUrl
  this.title = title
}

Bookmark.prototype.ELEMENT = function () {
  var a_tag = document.createElement('a')
  a_tag.href = this.url
  a_tag.className = 'link'
  a_tag.textContent = this.title
  var favimage = document.createElement('img')
  favimage.src = this.icon
  favimage.className = 'favicon'
  a_tag.insertBefore(favimage, a_tag.childNodes[0])
  return a_tag
}
function addBookmark () {
  const url = view.src
  const title = view.getTitle()
  favicon(url).then(function (fav) {
    const book = new Bookmark(uuid.v1(), url, fav, title)
    jsonfile.readFile(bookmarks, function (err, curr) {
      curr.push(book)
      jsonfile.writeFile(bookmarks, curr, function (err) {
      })
    })
  })
}
function openPopUp (event) {
  const state = popup.getAttribute('data-state')
  if (state === 'closed') {
    popup.innerHTML = ''
    jsonfile.readFile(bookmarks, function (err, obj) {
      if (obj.length !== 0) {
        for (var i = 0; i < obj.length; i++) {
          const url = obj[i].url
          const icon = obj[i].icon
          const id = obj[i].id
          const title = obj[i].title
          const bookmark = new Bookmark(id, url, icon, title)
          const el = bookmark.ELEMENT()
          popup.appendChild(el)
        }
      }
      popup.style.display = 'block'
      popup.setAttribute('data-state', 'open')
    })
  } else {
    popup.style.display = 'none'
    popup.setAttribute('data-state', 'closed')
  }
}

function handleUrl (event) {
  if (event.target.className === 'link') {
    event.preventDefault()
    view.loadURL(event.target.href)
  } else if (event.target.className === 'favicon') {
    event.preventDefault()
    view.loadURL(event.target.parentElement.href)
  }
}

function handleDevtools () {
  if (view.isDevToolsOpened()) {
    view.closeDevTools()
  } else {
    view.openDevTools()
  }
}

function updateNav (event) {
  omni.value = view.src
}

refresh.addEventListener('click', reloadView)
back.addEventListener('click', backView)
forward.addEventListener('click', forwardView)
omni.addEventListener('keydown', updateURL)
fave.addEventListener('click', addBookmark)
list.addEventListener('click', openPopUp)
popup.addEventListener('click', handleUrl)
dev.addEventListener('click', handleDevtools)
view.addEventListener('did-finish-load', updateNav)
// https://github.com/hokein/electron-sample-apps/blob/master/webview/browser/browser.js#L5
// To Do add dev tools open ✔️
// update url ✔️
// add bookmark by pressing button ✔️
// load all bookmarks when list is clicked ✔️

// To Do / Continue
// Feedback when loading
// Feedback with favorite icon to show that bookmark is not-added/added/already-added
// Tabs !:@
// Option to remove bookmarks.
