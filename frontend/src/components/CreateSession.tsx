import React, { useState } from "react";
import type { Form } from "./types";
import { categories } from "./categories";

export default function CreateSessionForm() {
  const [formData, setFormData] = useState<Form>({
    title: "",
    description: "",
    category: categories[0],
    date: "",
    time: "",
    maxParticipants: 1,
    isPublic: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(`Session created!`);
      setFormData({
        title: "",
        description: "",
        category: categories[0],
        date: "",
        time: "",
        maxParticipants: 1,
        isPublic: true,
      });
    } else {
      alert("Failed to create session");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <input
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        name="time"
        type="time"
        value={formData.time}
        onChange={handleChange}
        required
      />

      <input
        name="maxParticipants"
        type="number"
        min={1}
        value={formData.maxParticipants}
        onChange={handleChange}
        required
      />

      <label>
        Public Session
        <input
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Create Session</button>
    </form>
  );
}
