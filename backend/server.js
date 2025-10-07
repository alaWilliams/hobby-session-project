const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000;
const db = require('./data/db');

app.use(cors())
app.use(express.json())


app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})

// GET /sessions → list all public sessions
app.get('/sessions', (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions WHERE isPublic = 1').all()
  res.json(sessions)
})

// GET /sessions/:id → get details of one session
app.get('/sessions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id)
  
  if (session) {
    res.json(session)
  } else {
    res.status(404).json({
      error: 'Session not found'
    })
  }
})


// POST /sessions → create a new session (and generate a management code)
app.post('/sessions', (req, res) => {
  const { title, description, category, date, time, maxParticipants, isPublic } = req.body

  const managementCode = Math.random().toString(36).substring(2,8)
  const privateCode = isPublic ? null : Math.random().toString(36).substring(2,8);

  

  const insert = db.prepare(`
    INSERT INTO sessions (title, description, category, date, time, maxParticipants, isPublic, managementCode, privateCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = insert.run (
    title,
    description,
    category,
    date,
    time,
    maxParticipants,
    isPublic,
    managementCode, 
    privateCode
  )
  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    sessionId: result.lastInsertRowid,
    managementCode,
    privateCode,
  }
)})


// PUT /sessions/:id → edit a session (requires management code)

// DELETE /sessions/:id → delete a session (requires management code)

// Participants
// 6. POST /sessions/:id/join → join a session (generates attendance code)
// 7. DELETE /sessions/:id/leave → leave a session using attendance code
// 8. DELETE /sessions/:id/remove → remove a participant (requires management code)