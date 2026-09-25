"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, subject, message }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-teal-light/30 bg-teal-light/10 p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          Message sent!
        </p>
        <p className="mt-2 font-body text-sm text-slate">
          Thank you for reaching out. We will get back to you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="focus-ring mt-4 rounded-full bg-amber px-5 py-2 font-body text-sm font-semibold text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-ink">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="shx-input w-full"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-ink">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="shx-input w-full"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-ink">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 712 345 678"
            className="shx-input w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-ink">
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="shx-input w-full"
            required
          >
            <option value="">Select a subject</option>
            <option value="General enquiry">General enquiry</option>
            <option value="Booking question">Booking question</option>
            <option value="Service feedback">Service feedback</option>
            <option value="Partnership">Partnership</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          rows={5}
          className="shx-input w-full resize-none"
          required
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring w-full rounded-full bg-amber py-3 font-body text-sm font-semibold text-ink transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
