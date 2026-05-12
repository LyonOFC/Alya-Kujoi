import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

let descargas = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎵 YT2MP3',
        sections: [
          {
            title: '🔗 ENLACE DE YOUTUBE',
            rows: [
              {
                header: '📥 DESCARGA DIRECTA',
                title: '🎵 PEGAR LINK',
                description: 'https://youtu.be/...',
                id: `${usedPrefix}play `
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: { title: 'αℓуα - ρℓαу', subtitle: 'Youtube a Mp3', hasMediaAttachment: false },
      body: { text: `ㅤ    ꒰ 🎵 *αℓуα - ρℓαу* ⫏⫏ ꒱
ㅤ    ⿻ ✿ ιηƒσ 木 αтт 性

> ₊· Uѕσ: *${usedPrefix + command} + link*
> ₊· Eᴊᴇᴍᴘʟᴏ: *${usedPrefix + command} https://youtu.be/M0qv9fTlfdc*` },
      footer: { text: '⫏⫏ αℓуα - вσт ✿' },
      nativeFlowMessage: { buttons: [buttons] }
    })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  await m.react('🎵')

  let url = text.trim()
  
  if (!url.includes('youtu.be') && !url.includes('youtube.com')) {
    return m.reply(`❌ Link inválido\n\n${usedPrefix + command} https://youtu.be/M0qv9fTlfdc`)
  }

  try {
    const apiUrl = `https://dvlyonnxz.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.status || !data.result) throw new Error('Error')

    const { title, duration, thumbnail, download_url } = data.result
    
    const minutos = Math.floor(duration / 60)
    const segundos = duration % 60
    const duracion = `${minutos}:${segundos.toString().padStart(2, '0')}`

    const gameId = m.chat
    descargas[gameId] = {
      url: download_url,
      title: title
    }

    setTimeout(() => {
      if (descargas[gameId]) delete descargas[gameId]
    }, 60000)

    const buttons = {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🎵 DESCARGA',
        sections: [
          {
            title: '✅ CANCIÓN ENCONTRADA',
            rows: [
              {
                header: '📥 TOCA PARA DESCARGAR',
                title: title.substring(0, 35),
                description: `Duración: ${duracion}`,
                id: `audio_${gameId}`
              }
            ]
          }
        ]
      })
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: { title: 'αℓуα - ρℓαу', subtitle: 'Youtube a Mp3', hasMediaAttachment: false },
      body: { text: `ㅤ    ꒰ 🎵 *αℓуα - ρℓαу* ⫏⫏ ꒱
ㅤ    ⿻ ✿ ιηƒσ 木 αтт 性

> ₊· *Título:* ${title}
> ₊· *Duración:* ${duracion}
> ₊· *Toca el botón para descargar*` },
      footer: { text: '⫏⫏ αℓуα - вσт ✿' },
      nativeFlowMessage: { buttons: [buttons] }
    })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (error) {
    m.reply(`❌ Error al procesar el enlace`)
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || data.selectedRowId || null
    if (!id || !id.startsWith('audio_')) return false

    const gameId = id.replace('audio_', '')
    const descarga = descargas[gameId]
    
    if (!descarga) {
      await conn.sendMessage(m.chat, { text: `❌ El enlace expiró. Usa *play* nuevamente.` }, { quoted: m })
      return true
    }

    await conn.sendMessage(m.chat, { text: `⏳ *Descargando ${descarga.title}...*` }, { quoted: m })

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const audioPath = path.join(tmpDir, `${Date.now()}.mp3`)
    const audioRes = await fetch(descarga.url)
    const audioBuffer = await audioRes.buffer()
    fs.writeFileSync(audioPath, audioBuffer)

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(audioPath),
      mimetype: 'audio/mpeg',
      fileName: `${descarga.title}.mp3`
    }, { quoted: m })

    fs.unlinkSync(audioPath)
    delete descargas[gameId]
    await m.react('✅')

    return true

  } catch (e) {
    console.error(e)
    return true
  }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = ['play2', 'ytmp3']

export default handler
