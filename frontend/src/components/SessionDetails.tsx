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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendanceCode: attendanceCode }),
  });

  const data = await res.json();

  if (res.ok) {
    setLeaveMessage("You have left the session.");
    setAttendanceCode("");


    const updated = await fetch(`http://localhost:3000/sessions/${sessionId}`);
    const updatedSession = await updated.json();
    setSession(updatedSession);
  } else {
    setLeaveMessage(data.error || "Failed to leave the session.");
  }
};

  return (
    <div>
      <h2>{session.title}</h2>
      <p>{session.description}</p>
      <p>
        {session.currentParticipants ?? 0} / {session.maxParticipants} participants
      </p>

      {isFull ? (
        <p style={{ color: "red", fontWeight: "bold" }}>This session is full.</p>
      ) : joined ? (
        <p>{name}, you have successfully joined this session! Your attendance code is: <strong>{attendanceCode}</strong></p>
      ) : (
        <form onSubmit={handleJoin}>
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

    </div>
  );
}