import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Session, Form } from "./types";

export default function SessionManagement() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [managementCode, setManagementCode] = useState("");
  const [formData, setFormData] = useState<Form | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`http://localhost:3000/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data: Session) => {
        setSession(data);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          date: data.date,
          time: data.time,
          maxParticipants: data.maxParticipants,
          isPublic: !!data.isPublic,
        });
      });
  }, [sessionId]);

  if (!session || !formData) return <p>Loading...</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => prev && ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!formData) return;

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
    maxParticipants: Number(maxParticipants), // make sure it's a number
    isPublic: isPublic ? 1 : 0, // convert boolean to 1/0
    managementCode: managementCode.toString(), // ensure string
  }),
});


    if (res.ok) alert("Session updated!");
    else alert("Invalid management code or error updating");
  };

  const handleDelete = async () => {
    if (!managementCode) {
      alert("Please enter the management code.");
      ;
}

    const res = await fetch(`http://localhost:3000/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managementCode }),
    });

    if (res.ok) alert("Session deleted!");
    else alert("Invalid management code or error deleting");
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

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
      />
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        <option value="Sports">Sports</option>
        <option value="Music">Music</option>
        <option value="Art">Art</option>
        <option value="Technology">Technology</option>
        <option value="Cooking">Cooking</option>
        <option value="Gardening">Gardening</option>
        <option value="Wellness">Wellness</option>
      </select>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />
      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
      />
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
        />
      </label>

      <button onClick={handleUpdate} disabled={!managementCode}>Update Session</button>
      <button onClick={handleDelete} disabled={!managementCode}>Delete Session</button>
    </div>
  );
}
