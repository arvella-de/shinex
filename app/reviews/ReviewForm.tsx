"use client";

import { useState } from "react";

export default function ReviewForm({
  services,
  onSuccess,
}: {
  services: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const selectedService = services.find((s) => s.id === serviceId);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        title: title || undefined,
        comment,
        customerName,
        serviceId: serviceId || undefined,
        serviceName: selectedService?.name || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setRating(5);
    setTitle("");
    setComment("");
    setCustomerName("");
    setServiceId("");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-display text-xl font-semibold text-ink">
        Share your experience
      </h2>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-amber" : "text-ink/20"
              }`}
            >
              {star <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="shx-input w-full"
        />
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Your review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          className="shx-input w-full resize-none"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Your name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. James M."
          className="shx-input w-full"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-ink">
          Service used (optional)
        </label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="shx-input w-full"
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
