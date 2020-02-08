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
  console.log(options)
  // desktopCapturer.getSources(options, (error, sources) => {
  //   console.log('1')
  //   if (error) throw error
  //   console.log('2')
  //   const sourcesList = document.querySelector('.capturer-list')
  //   console.log('3')
  //   for (const source of sources) {
  //     console.log('click1')
  //     const thumb = source.thumbnail.toDataURL()
  //     if (!thumb) continue
  //     const title = source.name.slice(0, 20)
  //     const item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`
  //     sourcesList.appendChild(domify(item))
  //   }
  //   const links = sourcesList.querySelectorAll('a')
  //   for (let i = 0; i < links.length; ++i) {
  //     const closure = (i) => {
  //       return (e) => {
  //         e.preventDefault()
  //         ipcRenderer.send('source-id-selected', sources[i].id)
  //         sourcesList.innerHTML = ''
  //       }
  //     }
  //     links[i].onclick = closure(i)
  //     console.log(sources[0].id)
  //   }
  // })
  desktopCapturer.getSources(options).then(async sources => {
    console.log('1')
    console.log('2')
    const sourcesList = document.querySelector('.capturer-list')
    console.log('3')
    for (const source of sources) {
      // if (source.name === 'Electron') {
      try {
        console.log('click1')
        const thumb = source.thumbnail.toDataURL()
        console.log('thumb: ', thumb)
        if (!thumb) continue
        const title = source.name.slice(0, 20)
        console.log('title: ', title)
        const item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`
        console.log('item: ', item)
        sourcesList.appendChild(domify(item))
        console.log('sourcesList: ', sourcesList)
        console.log(sources)
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
          console.log('links[i].onclick: ', sources[0].id)
        }
      } catch (e) {
        console.log(e)
      }
      // }
    }
    console.log(sources)
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
    // for (const source of sources) {
    //   console.log('click1')
    //   const thumb = source.thumbnail.toDataURL()
    //   if (!thumb) continue
    //   const title = source.name.slice(0, 20)
    //   const item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`
    //   sourcesList.appendChild(domify(item))
    // }
    // console.log(sources)
    // const links = sourcesList.querySelectorAll('a')
    // for (let i = 0; i < links.length; ++i) {
    //   const closure = (i) => {
    //     return (e) => {
    //       e.preventDefault()
    //       ipcRenderer.send('source-id-selected', sources[i].id)
    //       sourcesList.innerHTML = ''
    //     }
    //   }
    //   links[i].onclick = closure(i)
    //   console.log(sources[0].id)
    // }
  })
})
