const jsonfile = require('jsonfile')
const favicon = require('favicon-getter').default
const path = require('path')
const uuid = require('uuid')
var bookmarks = path.join(__dirname, 'bookmarks.json')

function reloadView () {
  const view = document.getElementById('view')
  view.reload()
  // view.src = 'https://macau.school/'
}

function backView () {
  const view = document.getElementById('view')
  view.goBack()
}

function forwardView () {
  const view = document.getElementById('view')
  view.goForward()
}

function updateURL (event) {
  const omni = document.getElementById('url')
  const view = document.getElementById('view')
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
  const view = document.getElementById('view')
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
  const popup = document.getElementById('fave-popup')

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
  const view = document.getElementById('view')
  if (event.target.className === 'link') {
    event.preventDefault()
    view.loadURL(event.target.href)
  } else if (event.target.className === 'favicon') {
    event.preventDefault()
    view.loadURL(event.target.parentElement.href)
  }
}

function handleDevtools () {
  const view = document.getElementById('view')
  if (view.isDevToolsOpened()) {
    view.closeDevTools()
  } else {
    view.openDevTools()
  }
}

function updateNav (event) {
  const webview = document.querySelector('webview')

  const url = document.getElementById('url')
  url.value = webview.src
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#refresh').addEventListener('click', reloadView)
  document.querySelector('#back').addEventListener('click', backView)
  document.querySelector('#forward').addEventListener('click', forwardView)
  document.querySelector('#omnibox').addEventListener('keydown', updateURL)
  document.querySelector('#fave').addEventListener('click', addBookmark)
  document.querySelector('#list').addEventListener('click', openPopUp)
  document.querySelector('#fave-popup').addEventListener('click', handleUrl)
  document.querySelector('#console').addEventListener('click', handleDevtools)
  document.querySelector('#view').addEventListener('did-finish-load', updateNav)
  // refresh.addEventListener('click', reloadView)
  // back.addEventListener('click', backView)
  // forward.addEventListener('click', forwardView)
  // omni.addEventListener('keydown', updateURL)
  // fave.addEventListener('click', addBookmark)
  // list.addEventListener('click', openPopUp)
  // popup.addEventListener('click', handleUrl)
  // dev.addEventListener('click', handleDevtools)
  // view.addEventListener('did-finish-load', updateNav)
})
