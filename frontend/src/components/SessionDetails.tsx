import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Session } from "./types";

export default function SessionDetails() {
  const { sessionId: idParam } = useParams<{ sessionId: string }>();
  const sessionId = parseInt(idParam ?? "0");

  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");



  useEffect(() => {
    if (!sessionId) return;

    fetch(`http://localhost:3000/sessions/${sessionId}`)
      .then((res) => res.json())
      .then(setSession)
      .catch((err) => console.error("Error fetching session:", err));
  }, [sessionId]);


  if (!session) return <p>Loading...</p>;

  const isFull = (session.currentParticipants ?? 0) >= session.maxParticipants;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, attendanceCode }),
    });
    const data = await res.json();

    if (res.ok) {
      setJoined(true);
      setAttendanceCode(data.attendanceCode);
      const updated = await fetch(`http://localhost:3000/sessions/${sessionId}`);
      const updatedSession = await updated.json();
      setSession(updatedSession);
    }else {
      console.log('Cannot join session')
    }
  };

  const handleLeave = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!attendanceCode.trim()) return;

  const res = await fetch(`http://localhost:3000/sessions/${sessionId}/leave`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendanceCode: attendanceCode }),
  });

  const data = await res.json();

  if (res.ok) {
    setJoined(false)
    setLeaveMessage("You have left the session.");
    setAttendanceCode("");


    const updated = await fetch(`http://localhost:3000/sessions/${sessionId}`);
    const updatedSession = await updated.json();
    setSession(updatedSession);
  } else {
    setLeaveMessage(data.error || "Failed to leave the session.");
  }
};
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!')
}

  return (
    <div className="container">
      <div className = "session-card" >
        <h2>{session.title}</h2>
      <p>{session.description}</p>
      <p>
        {session.currentParticipants ?? 0} / {session.maxParticipants} participants
      </p>
      </div>
      

      {isFull ? (
        <p className="error">This session is full.</p>
      ) : joined ? (
        <p className="info">{name}, you have successfully joined this session! Your attendance code is: <strong className="message success">{attendanceCode}</strong> <button onClick={() => copyToClipboard(attendanceCode)}>Copy</button></p>
      ) : (
        <form className="form" onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isFull}>
            Join Session
          </button>
        </form>
      )}
      <h3>Leave this session</h3>
<form onSubmit={handleLeave} className="form">
  <input
    type="text"
    placeholder="Enter attendance code"
    value={attendanceCode}
    onChange={(e) => setAttendanceCode(e.target.value)}
  />
  <button
    type="submit"
  >
    Leave Session
  </button>
  {leaveMessage && <p className="info">{leaveMessage}</p>}
</form>

    </div>
  );
}