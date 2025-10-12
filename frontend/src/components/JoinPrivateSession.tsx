import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinPrivateSession() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

     const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter a private session code.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/session/${code.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Session not found.");
        return;
      }

  
      navigate(`/session/${code.trim()}`);
    } catch (err) {
      console.error(err);
      setError("Error connecting to server.");
    }
  };

  return (
    <div className="container">
      <h2>See details of a private session</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter private code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
