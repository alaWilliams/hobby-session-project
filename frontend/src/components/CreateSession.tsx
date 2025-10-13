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
    isPublic: true,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");



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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const res = await fetch("http://localhost:3000/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
      if (res.ok) {
      setSuccessMessage(`Session created! 
Management code: ${data.managementCode} 
${!formData.isPublic ? `Private code: ${data.privateCode}` : ""} 
Session ID: ${data.sessionId}`);

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
      setErrorMessage(data.error || "Failed to create session");
    }
};
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!')
}

  return (
    <form className="form"onSubmit={handleSubmit}>
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
      {successMessage && (
  <div className="message success">
    {successMessage}
    <button onClick={() => copyToClipboard(successMessage)}>Copy</button>
  </div>
)}

{errorMessage && (
  <div className="message error">
    {errorMessage}
  </div>
)}

    </form>
    

  );
}
