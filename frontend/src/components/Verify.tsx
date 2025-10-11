import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Verify() {
  const [managementCode, setManagementCode] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managementCode }),
    });


    const data = await res.json();

    if (!res.ok) {
      setError("Invalid management code.");
      return;
    }

    navigate(`/sessions/${data.sessionId}/manage?code=${data.managementCode}`);
  };

  return (
    <div className="verify-management">
      <h2>Enter Management Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={managementCode}
          onChange={(e) => setManagementCode(e.target.value)}
          placeholder="Enter management code"
          required
        />
        <input
  type="number"
  value={sessionId}
  onChange={(e) => setSessionId(e.target.value)}
  placeholder="Enter session ID"
  required
/>

        <button type="submit">Manage Session</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
