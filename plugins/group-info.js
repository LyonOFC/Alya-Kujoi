let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply(`
ㅤ    ꒰  ㅤ ❌ ㅤ *αℓуα - вσт* ㅤ ⫏⫏  ꒱
ㅤ    ⿻ ㅤ ✿ ㅤ єяяσя 木 ɢяυρσ ㅤ 性

> ₊· ⫏⫏ ㅤ Sσℓσ єη gяυρσѕ

ㅤ    ꒰  ㅤ ✿ ㅤ *αℓуα - вσт* ㅤ ⫏⫏ ꒱
  `.trim())

  await m.react('📊')

  try {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let botNumber = conn.user.jid
    
    let admins = []
    let regulars = []
    let botIsAdmin = false
    
    for (let member of participants) {
      if (member.admin === 'admin' || member.admin === 'superadmin') {
        admins.push(member.id)
        if (member.id === botNumber) botIsAdmin = true
      } else {
        regulars.push(member.id)
      }
    }
    
    let totalMiembros = participants.length
    let totalAdmins = admins.length
    let totalRegulares = regulars.length
    
    let groupIcon = 'https://files.catbox.moe/z4qgf1.jpeg'
    try {
      let icon = await conn.profilePictureUrl(m.chat, 'image')
      if (icon) groupIcon = icon
    } catch (e) {}
    
    let descripcion = groupMetadata.desc || 'Sin descripción'
    let fechaCreacion = groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toLocaleDateString() : 'Desconocida'
    let esRestringido = groupMetadata.announce ? '🔒 Cerrado (solo admins)' : '🔓 Abierto'
    let esWhatsApp = groupMetadata.ephemeralDuration > 0 ? `⏰ ${groupMetadata.ephemeralDuration / 86400} días` : '❌ Desactivado'
    
    let caption = `
ㅤ    ꒰  ㅤ 📊 ㅤ *INFO DEL GRUPO* ㅤ ⫏⫏  ꒱
ㅤ    ⿻ ㅤ ✿ ㅤ ∂αтσѕ 木 gяυρσ ㅤ 性

> ₊· ⫏⫏ ㅤ *📛 Nombre:* ${groupMetadata.subject}
> ₊· ⫏⫏ ㅤ *🆔 ID:* ${m.chat}
> ₊· ⫏⫏ ㅤ *📝 Descripción:* ${descripcion.substring(0, 80)}${descripcion.length > 80 ? '...' : ''}
> ₊· ⫏⫏ ㅤ *📅 Creado:* ${fechaCreacion}

ㅤ    ꒰  ㅤ 👥 ㅤ *MIEMBROS* ㅤ ⫏⫏  ꒱

> ₊· ⫏⫏ ㅤ *👤 Total:* ${totalMiembros}
> ₊· ⫏⫏ ㅤ *👑 Admins:* ${totalAdmins}
> ₊· ⫏⫏ ㅤ *👥 Regulares:* ${totalRegulares}

ㅤ    ꒰  ㅤ ⚙️ ㅤ *CONFIGURACIÓN* ㅤ ⫏⫏  ꒱

> ₊· ⫏⫏ ㅤ *🔒 Modo:* ${esRestringido}
> ₊· ⫏⫏ ㅤ *👁️ Mensajes efímeros:* ${esWhatsApp}
> ₊· ⫏⫏ ㅤ *🤖 Bot admin:* ${botIsAdmin ? '✅ Sí' : '❌ No'}

ㅤ    ꒰  ㅤ 👑 ㅤ *ADMINISTRADORES* ㅤ ⫏⫏  ꒱
${admins.slice(0, 10).map((admin, i) => `> ₊· ${i + 1}. @${admin.split('@')[0]}`).join('\n')}
${admins.length > 10 ? `> ₊· ... y ${admins.length - 10} más` : ''}

ㅤ    ꒰  ㅤ ✿ ㅤ *αℓуα - вσт* ㅤ ⫏⫏  ꒱
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: groupIcon },
      caption: caption,
      mentions: admins.slice(0, 15)
    }, { quoted: m })
    
    await m.react('✅')
    
  } catch (error) {
    console.error(error)
    await m.reply(`
ㅤ    ꒰  ㅤ ❌ ㅤ *αℓуα - вσт* ㅤ ⫏⫏  ꒱
ㅤ    ⿻ ㅤ ✿ ㅤ єяяσя 木 ιηƒσ ㅤ 性

> ₊· ⫏⫏ ㅤ *єяяσя:* ${error.message}

ㅤ    ꒰  ㅤ ✿ ㅤ *αℓуα - вσт* ㅤ ⫏⫏ ꒱
    `.trim())
    await m.react('❌')
  }
}

handler.help = ['groupinfo']
handler.tags = ['group']
handler.command = ['groupinfo', 'gpinfo', 'infogrupo']
handler.group = true

export default handler