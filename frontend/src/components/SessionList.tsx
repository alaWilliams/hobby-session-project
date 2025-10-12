import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "./types";

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);

    const fetchSessions = async () => {
    const res = await fetch("http://localhost:3000/sessions");
    const data = await res.json();
    setSessions(data);
  };



  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="container">
      <h1>Public Sessions</h1>
      <ul className='container'>
            {sessions.map((session) => (
          <li key={session.id} className="session-card">
              <Link to={`/sessions/${session.id}`}>
              <h3>{session.title}</h3>
            <p><strong>Category:</strong> {session.category}</p>
            <p><strong>Date:</strong> {session.date}</p>
            <p><strong>Time:</strong> {session.time}</p>
          
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
