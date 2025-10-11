import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Session } from "./types";

export default function PrivateSessionDetails() {
  const { privateCode } = useParams<{ privateCode: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [error, setError] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");
  

  useEffect(() => {
    if (!privateCode) return;

    fetch(`http://localhost:3000/session/${privateCode}`)
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setError("Could not load session"));
  }, [privateCode]);

  if (!session) return <p>Loading session...</p>;

  const isFull = (session.currentParticipants ?? 0) >= session.maxParticipants;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateCode || isFull) return;

    setError("");
    const res = await fetch(`http://localhost:3000/session/${privateCode}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, attendanceCode }),
    });

    const data = await res.json();

    if (res.ok) {
      setJoined(true);
      setAttendanceCode(data.attendanceCode);
         const updated = await fetch(`http://localhost:3000/session/${privateCode}`);
      const updatedSession = await updated.json();
      setSession(updatedSession);
    }else {
      console.log('Cannot join session')
    }

  };
  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!attendanceCode.trim()) return;

  const res = await fetch(`http://localhost:3000/session/${privateCode}/leave`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, attendanceCode }),
  });


  if (res.ok) {
    setJoined(false);
    setLeaveMessage("You have left the session.");

    setAttendanceCode("");
    const updated = await fetch(`http://localhost:3000/session/${privateCode}`);
    const updatedSession = await updated.json();
    setSession(updatedSession);
  } else {
    const data = await res.json();
    setError(data.error);
  }
};


  return (
    <div>
      <h2>{session.title}</h2>
      <p>{session.description}</p>
      <p>
        {session.currentParticipants ?? 0} / {session.maxParticipants} participants
      </p>
      {isFull && <p style={{ color: "red" }}>This session is full.</p>}
      {joined ? (
        <p>Your attendance code: <strong>{attendanceCode}</strong></p>
      ) : (
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={isFull}>Join Session</button>
        </form>
      )}
   <h3 className="text-lg font-semibold mt-4">Leave this session</h3>
<form onSubmit={handleLeave} className="space-y-2 mt-2">
  <input
    type="text"
    placeholder="Enter attendance code"
    value={attendanceCode}
    onChange={(e) => setAttendanceCode(e.target.value)}
    className="border p-2 rounded w-full"
  />
  <button
    type="submit"
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  >
    Leave Session
  </button>
  {leaveMessage && <p>{leaveMessage}</p>}
</form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
