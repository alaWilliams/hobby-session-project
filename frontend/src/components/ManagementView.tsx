import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Session, Form, Participant } from "./types";

export default function SessionManagement() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [managementCode, setManagementCode] = useState("");
  const [formData, setFormData] = useState<Form | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch session and participants together
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`http://localhost:3000/sessions/${sessionId}/manage`);
        const data = await res.json();
        setSession(data);
        setParticipants(data.participants);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          date: data.date,
          time: data.time,
          maxParticipants: data.maxParticipants,
          isPublic: !!data.isPublic,
        });
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading || !session || !formData) return <p>Loading...</p>;

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target;

  let newValue: string | number | boolean = value;

  if (type === "checkbox") {
    const target = e.target as HTMLInputElement;
    newValue = target.checked;
  }

  setFormData((prev) => prev && ({ ...prev, [name]: newValue }));
};


  const handleUpdate = async () => {
    if (!formData || !managementCode) {
      alert("Please enter the management code.");
      return;
    }

    const { title, description, category, date, time, maxParticipants, isPublic } = formData;

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        date,
        time,
        maxParticipants: Number(maxParticipants),
        isPublic: isPublic ? 1 : 0,
        managementCode: managementCode.toString(),
      }),
    });

    if (res.ok) {
      alert("Session updated!");
    } else {
      alert("Invalid management code or error updating");
    }
  };

  const handleDelete = async () => {
    if (!managementCode) {
      alert("Please enter the management code.");
      return;
    }

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managementCode }),
    });

    if (res.ok) {
      alert("Session deleted!");
    } else {
      alert("Invalid management code or error deleting");
    }
  };

  const handleDeleteParticipant = async (participantId: number) => {
    if (!managementCode) {
      alert("Please enter the management code to remove participants.");
      return;
    }

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, managementCode }),
    });

    if (res.ok) {
      setParticipants(participants.filter((p) => p.id !== participantId));
    } else {
      alert("Error deleting participant");
    }
  };

  return (
    <div>
      <h2>Manage Session: {session.title}</h2>

      <input
        type="text"
        placeholder="Management Code"
        value={managementCode}
        onChange={(e) => setManagementCode(e.target.value)}
      />

      <div>
        <input name="title" value={formData.title} onChange={handleChange} />
        <textarea name="description" value={formData.description} onChange={handleChange} />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Sports">Sports</option>
          <option value="Music">Music</option>
          <option value="Art">Art</option>
          <option value="Technology">Technology</option>
          <option value="Cooking">Cooking</option>
          <option value="Gardening">Gardening</option>
          <option value="Wellness">Wellness</option>
        </select>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
        <input type="time" name="time" value={formData.time} onChange={handleChange} />
        <input
          type="number"
          name="maxParticipants"
          min={1}
          value={formData.maxParticipants}
          onChange={handleChange}
        />
        <label>
          Public:
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            disabled
          />
        </label>
      </div>

<h3>Participants:</h3>
{participants.length === 0 ? (
  <p>No participants</p>
) : (
  <ul>
    {participants.map((p) => (
      <li key={p.id}>
        {p.name} 
        <button onClick={() => handleDeleteParticipant(p.id)}>Delete</button>
      </li>
    ))}
  </ul>
)}

      <div>
        <button onClick={handleUpdate} disabled={!managementCode}>
          Update Session
        </button>
        <button onClick={handleDelete} disabled={!managementCode}>
          Delete Session
        </button>
      </div>
    </div>
  );
}
