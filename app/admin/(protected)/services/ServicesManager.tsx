"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceRecord } from "@/lib/types";

type Draft = {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: "",
  durationMinutes: "",
};

export default function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceRecord[];
}) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  function startEdit(s: ServiceRecord) {
    setEditingId(s.id);
    setEditDraft({
      name: s.name,
      description: s.description,
      price: String(s.price),
      durationMinutes: String(s.durationMinutes),
    });
  }

  async function saveEdit(id: string) {
    setError(null);
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name,
        description: editDraft.description,
        price: Number(editDraft.price),
        durationMinutes: Number(editDraft.durationMinutes),
      }),
    });
    if (!res.ok) {
      setError("Could not save changes.");
      return;
    }
    const updated: ServiceRecord = await res.json();
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setEditingId(null);
    router.refresh();
  }

  async function toggleActive(s: ServiceRecord) {
    const res = await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    if (res.ok) {
      const updated: ServiceRecord = await res.json();
      setServices((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
      router.refresh();
    }
  }

  async function removeService(id: string) {
    if (!confirm("Remove this service? This cannot be undone.")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  async function submitNewService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !addDraft.name.trim() ||
      !addDraft.description.trim() ||
      !addDraft.price ||
      !addDraft.durationMinutes
    ) {
      setError("Please fill in every field.");
      return;
    }
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addDraft.name,
        description: addDraft.description,
        price: Number(addDraft.price),
        durationMinutes: Number(addDraft.durationMinutes),
      }),
    });
    if (!res.ok) {
      setError("Could not add the service.");
      return;
    }
    const created: ServiceRecord = await res.json();
    setServices((prev) => [...prev, created]);
    setAddDraft(emptyDraft);
    setAdding(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setAdding((v) => !v)}
          className="focus-ring rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-cream"
        >
          {adding ? "Cancel" : "Add new service"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={submitNewService}
          className="mt-4 grid gap-4 rounded-2xl border border-black/10 bg-paper p-6 sm:grid-cols-2"
        >
          <TextField
            label="Service name"
            value={addDraft.name}
            onChange={(v) => setAddDraft((d) => ({ ...d, name: v }))}
          />
          <TextField
            label="Price (KES)"
            type="number"
            value={addDraft.price}
            onChange={(v) => setAddDraft((d) => ({ ...d, price: v }))}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Description"
              value={addDraft.description}
              onChange={(v) =>
                setAddDraft((d) => ({ ...d, description: v }))
              }
            />
          </div>
          <TextField
            label="Duration (minutes)"
            type="number"
            value={addDraft.durationMinutes}
            onChange={(v) =>
              setAddDraft((d) => ({ ...d, durationMinutes: v }))
            }
          />
          <div className="flex items-end">
            <button
              type="submit"
              className="focus-ring rounded-full bg-amber px-5 py-2.5 font-body text-sm font-semibold text-ink"
            >
              Save service
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-3 font-body text-sm text-amber-dim">{error}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-paper">
        <div className="divide-y divide-black/10">
          {services.map((s) => (
            <div key={s.id} className="p-5">
              {editingId === s.id ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Service name"
                    value={editDraft.name}
                    onChange={(v) =>
                      setEditDraft((d) => ({ ...d, name: v }))
                    }
                  />
                  <TextField
                    label="Price (KES)"
                    type="number"
                    value={editDraft.price}
                    onChange={(v) =>
                      setEditDraft((d) => ({ ...d, price: v }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      label="Description"
                      value={editDraft.description}
                      onChange={(v) =>
                        setEditDraft((d) => ({ ...d, description: v }))
                      }
                    />
                  </div>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={editDraft.durationMinutes}
                    onChange={(v) =>
                      setEditDraft((d) => ({ ...d, durationMinutes: v }))
                    }
                  />
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => saveEdit(s.id)}
                      className="focus-ring rounded-full bg-amber px-5 py-2.5 font-body text-sm font-semibold text-ink"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="focus-ring rounded-full bg-black/5 px-5 py-2.5 font-body text-sm text-slate"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">
                      {s.name}{" "}
                      {!s.active && (
                        <span className="ml-2 rounded-full bg-black/5 px-2.5 py-0.5 font-body text-xs text-slate">
                          Paused
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 max-w-md font-body text-sm text-slate">
                      {s.description}
                    </p>
                    <p className="mt-1 font-body text-xs text-teal-deep">
                      KES {s.price.toLocaleString()} · ~{s.durationMinutes}{" "}
                      min
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="focus-ring rounded-full bg-black/5 px-4 py-1.5 font-body text-xs font-medium text-ink hover:bg-black/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(s)}
                      className="focus-ring rounded-full bg-teal-light/40 px-4 py-1.5 font-body text-xs font-medium text-teal-deep hover:bg-teal-light/60"
                    >
                      {s.active ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => removeService(s.id)}
                      className="focus-ring rounded-full bg-amber-light px-4 py-1.5 font-body text-xs font-medium text-amber-dim hover:opacity-80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-sm font-medium text-ink/80">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="shx-input"
      />
    </label>
  );
}
