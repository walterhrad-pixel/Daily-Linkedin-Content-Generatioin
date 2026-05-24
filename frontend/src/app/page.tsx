"use client";

import React, { useEffect, useRef, useState } from "react";

type HistoryEntry = {
  date: string;
  productName: string;
  snippet: string;
  content: string;
};

const STORAGE_KEY = "daily-content-history";

const ACCEPTED_TYPES =
  ".md,.markdown,.txt,.rst,.json,.yaml,.yml,.html,.htm,.csv";

export default function DailyContentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState<"" | "linkedin" | "twitter" | "blog">("");
  const [content, setContent] = useState(
    "Upload a document below and click Generate. The pipeline reads your file, mines an insight, drafts PAS copy, then humanizes it.",
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      /* ignore */
    }
  }, []);

  const saveHistory = (entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 7);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSourceFile(file);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!sourceFile) return;

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", sourceFile);
      formData.append("productName", productName);
      formData.append("audience", audience);
      if (format) formData.append("format", format);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        ok: boolean;
        content?: string;
        error?: string;
      };

      if (!data.ok || !data.content) {
        throw new Error(data.error ?? "Generation failed.");
      }

      setContent(data.content);
      const now = new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      saveHistory({
        date: now,
        productName,
        snippet: data.content.slice(0, 120) + (data.content.length > 120 ? "…" : ""),
        content: data.content,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = Boolean(sourceFile && productName && audience);

  return (
    <main className="page-shell">
      <button
        type="button"
        className="history-toggle"
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
        History
      </button>

      <aside className={`history-drawer ${drawerOpen ? "open" : ""}`}>
        <h2 className="drawer-title">Recent runs</h2>
        <div>
          {history.length === 0 ? (
            <p className="muted">Generated content will appear here.</p>
          ) : (
            history.map((item, i) => (
              <button
                key={`${item.date}-${i}`}
                type="button"
                className="history-item history-item-btn"
                onClick={() => {
                  setContent(item.content);
                  setProductName(item.productName);
                  setDrawerOpen(false);
                }}
              >
                <h4>{item.date} · {item.productName}</h4>
                <p>{item.snippet}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="glass-panel animate-in main-card">
        <header className="hero-header">
          <div className="hero-icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h1>Daily Content Generator</h1>
            <p className="hero-sub">
              Upload a single file (README, changelog, notes, etc.). A three-agent pipeline
              (Miner → Ghostwriter → Humanizer) turns it into human-sounding marketing
              copy — LinkedIn posts, threads, or blog intros.
            </p>
          </div>
        </header>

        <section className="form-grid" aria-label="Generation settings">
          <label>
            <span>Source file</span>
            <div className="file-upload-row">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="file-input-native"
              />
              <button
                type="button"
                className="btn-file"
                onClick={() => fileInputRef.current?.click()}
              >
                {sourceFile ? "Change file" : "Choose file"}
              </button>
              <span className="file-name">
                {sourceFile ? sourceFile.name : "Markdown, text, JSON, YAML, HTML, or CSV (max 2 MB)"}
              </span>
            </div>
          </label>
          <label>
            <span>Product name</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Acme Analytics"
            />
          </label>
          <label>
            <span>Target audience</span>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. startup founders, DevOps engineers"
            />
          </label>
          <label>
            <span>Format (optional)</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
              <option value="">Auto (agent chooses)</option>
              <option value="linkedin">LinkedIn post</option>
              <option value="twitter">Twitter thread</option>
              <option value="blog">Blog intro</option>
            </select>
          </label>
        </section>

        {error && <p className="error-banner" role="alert">{error}</p>}

        <div className="output-box">{content}</div>

        <div className="actions-row">
          <button
            type="button"
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
          >
            {loading ? "Running pipeline…" : "Generate content"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCopy} disabled={!content}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </main>
  );
}
