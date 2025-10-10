import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "./types";

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/sessions")
      .then((res) => res.json())
      .then(setSessions)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Public Sessions</h1>
      <ul>
            {sessions.map((session) => (
          <li key={session.id} className="session-item">
            <p><strong>Category:</strong> {session.category}</p>
            <p><strong>Date:</strong> {session.date}</p>
            <p><strong>Time:</strong> {session.time}</p>
            <Link to={`/sessions/${session.id}`}>
              <h3>{session.title}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
