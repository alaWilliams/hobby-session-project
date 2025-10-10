import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Session } from "./types";

export default function SessionDetails() {
  const { sessionId: idParam } = useParams<{ sessionId: string }>();
  const sessionId = parseInt(idParam ?? "0");

  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

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
      body: JSON.stringify({ name }),
    });

    if (res.ok) setJoined(true);
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
        <p>You have successfully joined this session!</p>
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
    </div>
  );
}
