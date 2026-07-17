require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { sendEmailNotification } = require('./NotificationService.cjs')

const app = express()
const PORT = Number(process.env.API_PORT || 3001)

app.use(cors())
app.use(express.json())

app.post('/api/notify/email', async (req, res) => {
  const { subject, body, to } = req.body ?? {}

  if (!subject || !body) {
    res.status(400).json({ error: 'subject and body are required' })
    return
  }

  const emailSent = await sendEmailNotification({ subject, body, to })
  res.json({ emailSent })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.info(`Notification API listening on http://localhost:${PORT}`)
})
