import { useState, useRef, useEffect } from "react";

// Point this at your FastAPI/Flask backend.
// Expected endpoint: POST /run-pipeline  body: { topic: string }
// Expected response: { search_result, scraped_content, report, feedback }
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000";

const INK = "#1A1816";
const PAPER = "#F7F4EE";
const PAPER_RAISED = "#FFFFFF";
const HAIRLINE = "#DEDACD";
const AMBER = "#B8722E";
const AMBER_DEEP = "#7A4A1C";
const SAGE = "#5C7A5C";
const SAGE_DEEP = "#3C5440";
const RUST = "#A8432E";
const RUST_DEEP = "#6E2C1D";
const MUTE = "#8A8478";

const DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const STAGES = [
  { key: "search", label: "Search", desk: "wire desk" },
  { key: "read", label: "Read", desk: "archive desk" },
  { key: "write", label: "Write", desk: "copy desk" },
  { key: "critic", label: "Critique", desk: "editor's desk" },
];

function FontLoader() {
  useEffect(() => {
    const id = "research-console-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function Stamp({ done, active, error, timestamp }) {
  // a rotated postmark-style seal that appears once a stage completes
  if (!done && !error) return null;
  const color = error ? RUST : SAGE;
  const colorDeep = error ? RUST_DEEP : SAGE_DEEP;
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        right: -8,
        transform: "rotate(-9deg)",
        border: `1.5px solid ${color}`,
        borderRadius: 3,
        padding: "1px 6px",
        background: PAPER,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: colorDeep,
          textTransform: "uppercase",
          lineHeight: 1.3,
        }}
      >
        {error ? "returned" : "filed"}
      </div>
      {timestamp && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 8,
            color: colorDeep,
            opacity: 0.75,
            lineHeight: 1.2,
          }}
        >
          {timestamp}
        </div>
      )}
    </div>
  );
}

function Desk({ stage, index, status, timestamp }) {
  // status: 'queued' | 'active' | 'done' | 'error'
  const isActive = status === "active";
  const isDone = status === "done";
  const isError = status === "error";

  let bg = PAPER_RAISED;
  let border = HAIRLINE;
  let numColor = MUTE;

  if (isActive) {
    border = AMBER;
    numColor = AMBER_DEEP;
  }
  if (isDone) {
    border = SAGE;
    numColor = SAGE_DEEP;
  }
  if (isError) {
    border = RUST;
    numColor = RUST_DEEP;
  }

  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 0",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 2,
        padding: "14px 14px 12px",
        minWidth: 0,
      }}
    >
      <Stamp done={isDone} error={isError} timestamp={timestamp} />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: numColor,
          letterSpacing: "0.04em",
          marginBottom: 6,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {stage.desk}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 17,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.01em",
          color: INK,
        }}
      >
        {stage.label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 12.5,
          color: MUTE,
          marginTop: 3,
        }}
      >
        {isActive ? "in progress\u2026" : isDone ? "complete" : isError ? "failed" : "awaiting"}
      </div>
      {isActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 2,
            width: "100%",
            background: HAIRLINE,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "40%",
              background: AMBER,
              animation: "rc-sweep 1.3s ease-in-out infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: MUTE,
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "0 0 10px",
      }}
    >
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: HAIRLINE }} />
    </div>
  );
}

function DataPanel({ label, content, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 2 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          padding: "10px 14px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: INK,
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: MUTE }}>
          {open ? "\u2212" : "+"}
        </span>
      </button>
      {open && (
        <div
          style={{
            borderTop: `1px solid ${HAIRLINE}`,
            padding: "12px 14px",
            fontFamily: MONO,
            fontSize: 12.5,
            lineHeight: 1.65,
            color: "#4A463E",
            whiteSpace: "pre-wrap",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function ReportColumn({ report }) {
  return (
    <div>
      <SectionLabel>Dispatch</SectionLabel>
      <div
        style={{
          background: PAPER_RAISED,
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 2,
          padding: "1.75rem 1.75rem 1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 1.8,
            color: INK,
            whiteSpace: "pre-wrap",
          }}
        >
          {report}
        </div>
      </div>
    </div>
  );
}

function CriticPanel({ feedback }) {
  const scoreMatch = feedback.match(/score:\s*(\d+)\s*\/\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  return (
    <div>
      <SectionLabel>Editor's mark</SectionLabel>
      <div
        style={{
          background: "#FBF1E6",
          border: `1px solid ${AMBER}`,
          borderRadius: 2,
          padding: "1.25rem 1.5rem",
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {score !== null && (
          <div
            style={{
              flexShrink: 0,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: `2px solid ${AMBER_DEEP}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: PAPER,
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 22,
                fontWeight: 500,
                color: AMBER_DEEP,
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: AMBER_DEEP }}>
              / 10
            </div>
          </div>
        )}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "#4A3A26",
            whiteSpace: "pre-wrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {feedback}
        </div>
      </div>
    </div>
  );
}

export default function ResearchConsole() {
  const [topic, setTopic] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [statusByKey, setStatusByKey] = useState({});
  const [timestamps, setTimestamps] = useState({});
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const currentIndexRef = useRef(0);

  function stampNow() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  async function runPipeline() {
    if (!topic.trim() || running) return;

    setRunning(true);
    setError(null);
    setResult(null);
    setStatusByKey({ search: "active" });
    setTimestamps({});
    setActiveIndex(0);
    currentIndexRef.current = 0;

    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx >= STAGES.length - 1) {
        clearInterval(timerRef.current);
        return;
      }

      const finishedKey = STAGES[idx].key;
      idx += 1;
      const nextKey = STAGES[idx].key;
      currentIndexRef.current = idx;

      setStatusByKey((prev) => ({
        ...prev,
        [finishedKey]: "done",
        [nextKey]: "active",
      }));
      setTimestamps((prev) => ({ ...prev, [finishedKey]: stampNow() }));
      setActiveIndex(idx);
    }, 1700);

    try {
      const res = await fetch(`${API_URL}/run-pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      clearInterval(timerRef.current);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server responded with ${res.status}${text ? `: ${text}` : ""}`);
      }

      const data = await res.json();
      const allDone = {};
      const allStamps = {};
      STAGES.forEach((s) => {
        allDone[s.key] = "done";
        allStamps[s.key] = stampNow();
      });
      setStatusByKey(allDone);
      setTimestamps(allStamps);
      setActiveIndex(STAGES.length);
      setResult(data);
    } catch (err) {
      clearInterval(timerRef.current);
      const failedKey = STAGES[currentIndexRef.current]?.key || STAGES[0].key;
      setStatusByKey((prev) => ({ ...prev, [failedKey]: "error" }));
      setError(err.message || "Something went wrong while running the pipeline.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 820,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
        background: PAPER,
        minHeight: "100vh",
        color: INK,
      }}
    >
      <FontLoader />
      <style>{`
        @keyframes rc-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .rc-input::placeholder { color: #A39C8C; }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: `2px solid ${INK}`,
          paddingBottom: 14,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: MUTE,
              marginBottom: 2,
            }}
          >
            Vol. I &mdash; multi-agent wire service
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 34,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              margin: 0,
            }}
          >
            The Research Desk
          </h1>
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: MUTE,
            textAlign: "right",
          }}
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label
          htmlFor="rc-topic"
          style={{
            display: "block",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: MUTE,
            marginBottom: 8,
          }}
        >
          Assign a story
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            id="rc-topic"
            className="rc-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runPipeline()}
            placeholder="e.g. the effect of war on trading markets"
            disabled={running}
            style={{
              flex: 1,
              height: 46,
              padding: "0 16px",
              fontSize: 15,
              fontFamily: SERIF,
              border: `1px solid ${running ? HAIRLINE : INK}`,
              borderRadius: 2,
              background: running ? "#EFEBE0" : PAPER_RAISED,
              outline: "none",
              color: INK,
            }}
          />
          <button
            onClick={runPipeline}
            disabled={running || !topic.trim()}
            style={{
              height: 46,
              padding: "0 24px",
              fontFamily: DISPLAY,
              fontSize: 14,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: PAPER,
              background: running || !topic.trim() ? "#B4AFA0" : INK,
              border: "none",
              borderRadius: 2,
              cursor: running || !topic.trim() ? "default" : "pointer",
            }}
          >
            {running ? "Running" : "Dispatch"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {STAGES.map((s, i) => (
          <Desk
            key={s.key}
            stage={s}
            index={i}
            status={statusByKey[s.key] || "queued"}
            timestamp={timestamps[s.key]}
          />
        ))}
      </div>

      {!result && !error && !running && (
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 15,
            color: MUTE,
            textAlign: "center",
            padding: "2.5rem 0",
            borderTop: `1px dashed ${HAIRLINE}`,
          }}
        >
          The desk is quiet. Assign a story above to send it through the wire.
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#FBEAE5",
            border: `1px solid ${RUST}`,
            borderRadius: 2,
            padding: "1rem 1.25rem",
            fontFamily: MONO,
            fontSize: 13,
            color: RUST_DEEP,
            marginBottom: 24,
          }}
        >
          dispatch returned: {error}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SectionLabel>Wire desk &mdash; raw feed</SectionLabel>
            <DataPanel label="Search results" content={result.search_result} />
          </div>
          <div>
            <SectionLabel>Archive desk &mdash; raw feed</SectionLabel>
            <DataPanel label="Scraped content" content={result.scraped_content} />
          </div>

          <ReportColumn report={result.report} />
          <CriticPanel feedback={result.feedback} />
        </div>
      )}
    </div>
  );
}
