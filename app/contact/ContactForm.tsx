"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-5 rounded-xl bg-teal-light/30 px-5 py-4 font-body text-sm text-teal-deep">
        Thanks, {name.split(" ")[0] || "there"}. Your message has been
        recorded — we&apos;ll get back to you at {email}.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink/80">
          Your name
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shx-input"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink/80">
          Your email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shx-input"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink/80">
          Message
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="shx-input resize-none"
        />
      </div>
      <button
        type="submit"
        className="focus-ring w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-cream"
      >
        Submit enquiry
      </button>
    </form>
  );
}
