const { desktopCapturer, ipcRenderer, dialog } = require('electron')
const domify = require('domify')

document.onkeydown = function (evt) {
  evt = evt || window.event
  // Press esc key.
  if (evt.keyCode === 27) {
    ipcRenderer.send('source-id-selected', null)
  }
}

ipcRenderer.on('get-sources', (event, options) => {
  console.log('click')
  desktopCapturer.getSources(options, (error, sources) => {
    if (error) throw error
    const sourcesList = document.querySelector('.capturer-list')
    for (const source of sources) {
      console.log('click1')
      const thumb = source.thumbnail.toDataURL()
      if (!thumb) continue
      const title = source.name.slice(0, 20)
      const item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`
      sourcesList.appendChild(domify(item))
    }
    const links = sourcesList.querySelectorAll('a')
    for (let i = 0; i < links.length; ++i) {
      const closure = (i) => {
        return (e) => {
          e.preventDefault()
          ipcRenderer.send('source-id-selected', sources[i].id)
          sourcesList.innerHTML = ''
        }
      }
      links[i].onclick = closure(i)
      console.log(sources[0].id)
    }
  })
})
