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

  useEffect(() => {
    if (!privateCode) return;

    fetch(`http://localhost:3000/sessions/private/${privateCode}`)
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(err => setError("Could not load session"));
  }, [privateCode]);

  if (!session) return <p>Loading session...</p>;

  const isFull = (session.currentParticipants ?? 0) >= session.maxParticipants;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateCode || isFull) return;

    setError("");
    const res = await fetch(`http://localhost:3000/sessions/private/${privateCode}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setJoined(true);
      setAttendanceCode(data.attendanceCode);

      // Reload session to update participant count
      const updated = await fetch(`http://localhost:3000/sessions/private/${privateCode}`);
      const updatedSession = await updated.json();
      setSession(updatedSession);
    } else {
      setError(data.error || "Could not join session");
    }
  };
  const handleLeave = async () => {
  const res = await fetch(`http://localhost:3000/sessions/private/${privateCode}/leave`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, attendanceCode }),
  });

  if (res.ok) {
    setJoined(false);
    setAttendanceCode("");
    const updated = await fetch(`http://localhost:3000/sessions/private/${privateCode}`);
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
