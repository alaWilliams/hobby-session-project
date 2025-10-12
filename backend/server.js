const express = require('express');
const app = express();
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

// GET /sessions/:id → public session by ID
app.get('/sessions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND isPublic = 1').get(id);

  if (!session) return res.status(404).json({ error: 'Session not found' });

  // count current participants
  const countResult = db.prepare('SELECT COUNT(*) as currentParticipants FROM participants WHERE sessionId = ?').get(id);
  session.currentParticipants = countResult.currentParticipants;

  res.json(session);
});

// GET /sessions/:id/manage → get session with participants
app.get('/sessions/:id/manage', (req, res) => {
  const sessionId = parseInt(req.params.id);

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participants = db.prepare('SELECT * FROM participants WHERE sessionId = ?').all(sessionId);

  res.json({ ...session, participants });
});


// GET /session/:code → private session by code
app.get('/session/:privateCode', (req, res) => {
  const privateCode = req.params.privateCode;

  const session = db.prepare('SELECT * FROM sessions WHERE privateCode = ?').get(privateCode);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const countResult = db.prepare('SELECT COUNT(*) as currentParticipants FROM participants WHERE sessionId = ?').get(session.id);
  session.currentParticipants = countResult.currentParticipants;

  res.json(session);
});




// POST /sessions → create a new session (and generate a management code)
app.post('/session', (req, res) => {
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
    Number(maxParticipants),
    isPublic ? 1 : 0,
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


//POST verify management code
// POST /sessions/verify
app.post('/sessions/:sessionId/verify', (req, res) => {
  
  const sessionId = parseInt(req.params.sessionId)
  const { managementCode } = req.body;

  if (!managementCode) {
    return res.status(400).json({ error: 'Management code is required' });
  }
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
;

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

   if (session.managementCode !== managementCode) {
    return res.status(403).json({ error: 'Invalid management code' });
  }

  res.json({
    success: true,
    sessionId: session.id,
    managementCode,
    message: `Session "${session.title}" verified successfully.`,
  });
});

// POST /sessions/private/:code/join → join a private session
app.post('/session/:privateCode/join', (req, res) => {
  const { privateCode } = req.params;
  const { name } = req.body;

  const session = db.prepare('SELECT * FROM sessions WHERE privateCode = ?').get(privateCode);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Count current participants
  const countResult = db.prepare('SELECT COUNT(*) as currentCount FROM participants WHERE sessionId = ?').get(session.id);
  if (countResult.currentCount >= session.maxParticipants) {
    return res.status(400).json({ error: 'Session is full' });
  }

  const attendanceCode = Math.random().toString(36).substring(2, 8);
  const insert = db.prepare('INSERT INTO participants (sessionId, name, attendanceCode) VALUES (?, ?, ?)');
  insert.run(session.id, name, attendanceCode);

  res.json({ attendanceCode });
});



// PUT /sessions/:id → edit a session (requires management code)
app.put('/sessions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const {
    title,
    description,
    category,
    date,
    time,
    maxParticipants,
    isPublic,
    managementCode
  } = req.body;

  
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  if (session.managementCode !== managementCode) {
    return res.status(403).json({ error: 'Invalid management code' });
  }

  const update = db.prepare(`
    UPDATE sessions
    SET title = ?, description = ?, category = ?, date = ?, time = ?, maxParticipants = ?, isPublic = ?
    WHERE id = ?
  `);

  const result = update.run(
    title,
    description,
    category,
    date,
    time,
    maxParticipants,
    isPublic,
    id
  );

  res.json({ success: true, message: 'Session updated' });
});


// DELETE /sessions/:id → delete a session (requires management code)
app.delete('/sessions/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { managementCode } = req.body

  const deleteParticipants = db.prepare('DELETE FROM participants WHERE sessionId = ?');
  deleteParticipants.run(id);

  const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ? AND managementCode = ?');
  const result = deleteSession.run(id, managementCode);

  if (result.changes > 0) {
    res.status(204).send()
  } else {
    res.status(404).json({ error: 'Session not found' })
  }
})

// Participants
// 6. POST /sessions/:id/join → join a session (generates attendance code)
app.post('/sessions/:id/join', (req,res) =>{
  const id = parseInt(req.params.id);
  //Check maxParticipants of that session
  const maxP = db.prepare (`
    SELECT maxParticipants from sessions WHERE id = ?`)
  const session = maxP.get(id)
   if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  const maxParticipants = session.maxParticipants;

  //Check current Participants
  const countP = db.prepare('SELECT COUNT(*) as count FROM participants WHERE sessionId = ?');
  const countResult = countP.get(id);
  const currentCount = countResult.count;


  if (currentCount >= maxParticipants) {
  return res.status(404).json({error: 'Session full'})
}


  const attendanceCode = Math.random().toString(36).substring(2,8);
  const { name } = req.body
  if (!name || name.trim() === '') {
  return res.status(400).json({ error: 'Name is required' });
}
  const insert = db.prepare(`
    INSERT INTO participants (sessionId, name, attendanceCode) VALUES (?, ?, ?)
    `)

    const result = insert.run(
      id,
      name,
      attendanceCode
    )

    res.status(201).json({
    success: true,
    message: 'Joined session successfully',
    attendanceCode
  });
}
);

// 7. DELETE /sessions/:id/leave → leave a session using attendance code
app.delete('/sessions/:id/leave', (req, res) => {
  const sessionId = parseInt(req.params.id);
  const { attendanceCode } = req.body;


  if (!attendanceCode) {
    return res.status(400).json({ error: 'Attendance code is required' });
  }

  const participant = db
    .prepare('SELECT * FROM participants WHERE sessionId = ? AND attendanceCode = ?')
    .get(sessionId, attendanceCode);

  if (!participant) {
    return res.status(404).json({ error: 'Invalid attendance code or participant not found' });
  }

  db.prepare('DELETE FROM participants WHERE id = ?').run(participant.id);

  res.json({ success: true, message: 'You have successfully left the session.' });
});

// DELETE /sessions/private/:privateCode/leave
app.delete('/session/:privateCode/leave', (req, res) => {
  const privateCode = req.params.privateCode;
  const { name, attendanceCode } = req.body;

  const session = db.prepare('SELECT * FROM sessions WHERE privateCode = ?').get(privateCode);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const deleteParticipant = db.prepare(
    'DELETE FROM participants WHERE sessionId = ? AND name = ? AND attendanceCode = ?'
  );
  const result = deleteParticipant.run(session.id, name, attendanceCode);

  if (result.changes > 0) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Could not leave the session' });
  }
});



// 8. DELETE /sessions/:id/remove → remove a participant (requires management code)
app.delete('/sessions/:id/remove', (req, res) => {
  const sessionId = parseInt(req.params.id)
  const { participantId, managementCode } = req.body


   const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!session || session.managementCode !== managementCode) {
    return res.status(403).json({ error: 'Invalid management code' });
  }
  const deleteParticipant = db.prepare('DELETE FROM participants WHERE id = ? AND sessionId = ?');
  const result = deleteParticipant.run(participantId, sessionId);

  if (result.changes > 0) {
    res.status(204).send()
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})