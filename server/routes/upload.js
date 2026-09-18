import { Router } from 'express'

export const uploadRouter = Router()

// Handles file uploads (accepts base64 or data URLs, returns clean file URL/data)
uploadRouter.post('/', (req, res) => {
  try {
    const { name, data, type } = req.body
    if (!data) {
      return res.status(400).json({ error: 'No file data provided' })
    }

    // Return the data URL or uploaded representation
    const fileUrl = data.startsWith('data:') ? data : `data:${type || 'application/octet-stream'};base64,${data}`

    return res.status(201).json({
      success: true,
      name: name || 'Uploaded file',
      url: fileUrl,
      size: `${Math.round((data.length * 0.75) / 1024)} KB`,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
