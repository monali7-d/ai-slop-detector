import { useState, useCallback, useRef, useEffect } from "react";

const AI_PATTERNS = [
  {
    id: "significance",
    name: "Inflated significance",
    desc: "Puffing up importance with \"pivotal\", \"testament\", \"vital role\"",
    regex: /\b(stands?\s+as|serves?\s+as|is\s+a\s+testament|enduring\s+testament|pivotal\s+moment|vital\s+role|significant\s+role|crucial\s+role|key\s+(role|moment|turning\s+point)|underscores?|highlights?\s+(its|the)\s+importance|reflects?\s+broader|symboliz(es?|ing)\s+(its|the)|setting\s+the\s+stage|marking\s+a|shaping\s+the|indelible\s+mark|deeply\s+rooted|evolving\s+landscape|focal\s+point)\b/gi,
    color: "#FF6B6B",
  },
  {
    id: "promotional",
    name: "Promotional language",
    desc: "Travel-brochure vibes: \"nestled\", \"vibrant\", \"breathtaking\"",
    regex: /\b(boasts?\s+a|vibrant|profound|showcas(es?|ing)|exemplif(ies|y)|commitment\s+to|natural\s+beauty|nestled|in\s+the\s+heart\s+of|groundbreaking|renowned|breathtaking|must-visit|stunning)\b/gi,
    color: "#FFA07A",
  },
  {
    id: "ai_vocab",
    name: "AI vocabulary",
    desc: "The dead giveaways: \"delve\", \"landscape\", \"tapestry\", \"foster\"",
    regex: /\b(additionally|align\s+with|crucial|delve|emphasizing|enduring|enhance[ds]?|fostering|garner(s|ed)?|interplay|intricac(ies|y)|intricate|landscape|pivotal|tapestry|testament|underscore[ds]?|valuable|vibrant)\b/gi,
    color: "#FFD93D",
  },
  {
    id: "ing_phrases",
    name: "Superficial -ing analyses",
    desc: "Fake depth: \"highlighting...\", \"ensuring...\", \"reflecting...\"",
    regex: /,?\s*(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing\s+to|cultivating|fostering|encompassing|showcasing)\s+/gi,
    color: "#6BCB77",
  },
  {
    id: "copula_avoidance",
    name: "Copula avoidance",
    desc: "\"Serves as\" instead of \"is\". Just say what it is.",
    regex: /\b(serves?\s+as|stands?\s+as|marks?\s+a|represents?\s+a|boasts?\s+|features?\s+a|offers?\s+a)\b/gi,
    color: "#4D96FF",
  },
  {
    id: "negative_parallelism",
    name: "Negative parallelisms",
    desc: "\"It's not just X; it's Y\" — the AI's favorite rhetorical move",
    regex: /\b(not\s+only\s+.{1,40}but\s+(also)?|it'?s\s+not\s+just\s+about|not\s+merely|no\s+guessing|no\s+wasted)\b/gi,
    color: "#9B59B6",
  },
  {
    id: "rule_of_three",
    name: "Rule of three",
    desc: "Forced triplets: \"innovation, inspiration, and industry insights\"",
    regex: /\b(\w+),\s+(\w+),\s+and\s+(\w+)\b/gi,
    color: "#E67E22",
  },
  {
    id: "chatbot_artifacts",
    name: "Chatbot artifacts",
    desc: "\"Great question!\", \"I hope this helps!\", \"Let me know!\"",
    regex: /\b(I\s+hope\s+this\s+helps|of\s+course!|certainly!|you'?re\s+absolutely\s+right|would\s+you\s+like|let\s+me\s+know|here\s+is\s+a|great\s+question|let'?s\s+dive\s+in|let'?s\s+explore|let'?s\s+break\s+this\s+down|here'?s\s+what\s+you\s+need\s+to\s+know|without\s+further\s+ado)\b/gi,
    color: "#1ABC9C",
  },
  {
    id: "em_dashes",
    name: "Em dash overuse",
    desc: "AI loves em dashes. Most can be commas or periods.",
    regex: /\u2014|--/g,
    color: "#E74C3C",
  },
  {
    id: "hedging",
    name: "Excessive hedging",
    desc: "\"could potentially possibly be argued that it might\"",
    regex: /\b(could\s+potentially|it\s+could\s+be\s+argued|might\s+potentially|it\s+is\s+worth\s+noting|it\s+is\s+important\s+to\s+note)\b/gi,
    color: "#8E44AD",
  },
  {
    id: "filler",
    name: "Filler phrases",
    desc: "\"In order to\", \"due to the fact that\", \"at this point in time\"",
    regex: /\b(in\s+order\s+to|due\s+to\s+the\s+fact\s+that|at\s+this\s+point\s+in\s+time|in\s+the\s+event\s+that|has\s+the\s+ability\s+to|it\s+is\s+important\s+to\s+note\s+that|in\s+today'?s\s+rapidly)\b/gi,
    color: "#2ECC71",
  },
  {
    id: "generic_conclusion",
    name: "Generic positive endings",
    desc: "\"The future looks bright. Exciting times lie ahead.\"",
    regex: /\b(the\s+future\s+looks\s+bright|exciting\s+times\s+(lie|lay)\s+ahead|continue\s+(this|their|our)\s+journey|a\s+(major\s+)?step\s+in\s+the\s+right\s+direction|paving\s+the\s+way)\b/gi,
    color: "#F39C12",
  },
  {
    id: "false_ranges",
    name: "False ranges",
    desc: "\"From X to Y, from A to B\" — fake scale and sweep",
    regex: /from\s+\w[\w\s]{1,30}\s+to\s+\w[\w\s]{1,30},\s*from\s+/gi,
    color: "#D35400",
  },
  {
    id: "vague_attribution",
    name: "Vague attributions",
    desc: "\"Experts argue\", \"industry reports\", \"observers have cited\"",
    regex: /\b(industry\s+reports|observers?\s+have\s+(cited|noted)|experts?\s+(argue|believe|say)|some\s+critics\s+argue|several\s+sources)\b/gi,
    color: "#16A085",
  },
  {
    id: "signposting",
    name: "Signposting",
    desc: "Announcing what you're about to do instead of doing it",
    regex: /\b(let'?s\s+dive\s+in(to)?|let'?s\s+explore|let'?s\s+break\s+this\s+down|here'?s\s+what\s+you\s+need\s+to\s+know|now\s+let'?s\s+look\s+at|without\s+further\s+ado)\b/gi,
    color: "#2980B9",
  },
];

const SAMPLE_TEXT = `Great question! Let's dive in.

AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools — nestled at the intersection of research and practice — are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.

At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale, ensuring that organizations can remain agile while delivering seamless, intuitive, and powerful experiences to users.

Industry observers have noted that adoption has accelerated from hobbyist experiments to enterprise-wide rollouts, from solo developers to cross-functional teams. Additionally, the ability to generate documentation, tests, and refactors showcases how AI can contribute to better outcomes, highlighting the intricate interplay between automation and human judgment.

While it could potentially be argued that these tools might have some positive effect, the future looks bright. Exciting times lie ahead as we continue this journey toward excellence. I hope this helps! Let me know if you'd like me to expand on any section.`;

function analyzeText(text) {
  if (!text.trim()) return { matches: [], score: 0, findings: [] };

  const allMatches = [];
  const findings = [];

  AI_PATTERNS.forEach((pattern) => {
    const matches = [...text.matchAll(pattern.regex)];
    if (matches.length > 0) {
      findings.push({
        ...pattern,
        count: matches.length,
        examples: matches.slice(0, 3).map((m) => m[0]),
      });
      matches.forEach((m) => {
        allMatches.push({
          start: m.index,
          end: m.index + m[0].length,
          patternId: pattern.id,
          color: pattern.color,
          text: m[0],
        });
      });
    }
  });

  // Sort by start position
  allMatches.sort((a, b) => a.start - b.start);

  // De-overlap
  const cleaned = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) {
      cleaned.push(m);
      lastEnd = m.end;
    }
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const matchedWords = cleaned.reduce(
    (sum, m) => sum + m.text.split(/\s+/).filter(Boolean).length,
    0
  );
  const slopRatio = wordCount > 0 ? matchedWords / wordCount : 0;

  // Score: 0 = clean, 100 = pure slop
  let score = Math.min(100, Math.round(slopRatio * 400 + findings.length * 4));

  return { matches: cleaned, score, findings };
}

function getVerdict(score) {
  if (score === 0) return { label: "Clean", emoji: "", desc: "No AI patterns detected. Nice." };
  if (score < 15) return { label: "Mostly human", emoji: "", desc: "A couple tells, but nothing alarming." };
  if (score < 35) return { label: "Suspicious", emoji: "", desc: "There are signs. A human editor would catch these." };
  if (score < 60) return { label: "Likely AI", emoji: "", desc: "Multiple patterns. This reads like a chatbot wrote it." };
  if (score < 80) return { label: "AI slop", emoji: "", desc: "Heavy pattern density. Classic LLM output." };
  return { label: "Pure slop", emoji: "", desc: "This is a textbook example of AI writing." };
}

function HighlightedText({ text, matches, activePattern }) {
  if (!matches.length) {
    return <span style={{ color: "var(--text-secondary)" }}>{text}</span>;
  }

  const parts = [];
  let lastIdx = 0;

  matches.forEach((m, i) => {
    if (m.start > lastIdx) {
      parts.push(
        <span key={`t-${i}`} style={{ color: "var(--text-secondary)" }}>
          {text.slice(lastIdx, m.start)}
        </span>
      );
    }
    const isActive = !activePattern || activePattern === m.patternId;
    parts.push(
      <span
        key={`m-${i}`}
        style={{
          backgroundColor: isActive ? m.color + "33" : "transparent",
          borderBottom: isActive ? `2px solid ${m.color}` : "none",
          color: isActive ? "var(--text-primary)" : "var(--text-muted)",
          transition: "all 0.3s ease",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {text.slice(m.start, m.end)}
      </span>
    );
    lastIdx = m.end;
  });

  if (lastIdx < text.length) {
    parts.push(
      <span key="last" style={{ color: "var(--text-secondary)" }}>
        {text.slice(lastIdx)}
      </span>
    );
  }

  return <>{parts}</>;
}

function ScoreGauge({ score }) {
  const verdict = getVerdict(score);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s < 15) return "#4ADE80";
    if (s < 35) return "#FACC15";
    if (s < 60) return "#FB923C";
    if (s < 80) return "#F87171";
    return "#EF4444";
  };

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="6"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center",
        }}>
          <div style={{
            fontSize: 32, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: getColor(score),
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{
            fontSize: 10, color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.05em", marginTop: 2,
          }}>
            / 100
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12,
        fontSize: 16,
        fontWeight: 600,
        color: getColor(score),
        fontFamily: "'Space Mono', monospace",
      }}>
        {verdict.label}
      </div>
      <div style={{
        fontSize: 12,
        color: "var(--text-muted)",
        marginTop: 4,
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 200,
        margin: "4px auto 0",
      }}>
        {verdict.desc}
      </div>
    </div>
  );
}

function PatternPill({ finding, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(isActive ? null : finding.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        border: isActive ? `1.5px solid ${finding.color}` : "1.5px solid var(--border-subtle)",
        background: isActive ? finding.color + "15" : "var(--surface-secondary)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        width: "100%",
        textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        backgroundColor: finding.color, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: "var(--text-primary)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {finding.name}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: finding.color,
            fontWeight: 700,
            marginLeft: 8,
            flexShrink: 0,
          }}>
            {finding.count}x
          </span>
        </div>
        <div style={{
          fontSize: 11, color: "var(--text-muted)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {finding.desc}
        </div>
      </div>
    </button>
  );
}

export default function AIHumanizer() {
  const [text, setText] = useState("");
  const [activePattern, setActivePattern] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef(null);

  const analysis = analyzeText(text);

  const handleAnalyze = useCallback(() => {
    if (text.trim()) setShowResults(true);
  }, [text]);

  const handleLoadSample = useCallback(() => {
    setText(SAMPLE_TEXT);
    setShowResults(true);
    setActivePattern(null);
  }, []);

  const handleClear = useCallback(() => {
    setText("");
    setShowResults(false);
    setActivePattern(null);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text-primary)",
      fontFamily: "'DM Sans', sans-serif",
      padding: "32px 20px",
      maxWidth: 1100,
      margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --bg: #0D0D0D;
          --surface: #161616;
          --surface-secondary: #1C1C1C;
          --surface-elevated: #222222;
          --border-subtle: #2A2A2A;
          --border-medium: #3A3A3A;
          --text-primary: #E8E8E8;
          --text-secondary: #A0A0A0;
          --text-muted: #6B6B6B;
          --accent: #FF6B6B;
          --accent-dim: #FF6B6B22;
        }

        @media (prefers-color-scheme: light) {
          :root {
            --bg: #FAFAFA;
            --surface: #FFFFFF;
            --surface-secondary: #F5F5F5;
            --surface-elevated: #FFFFFF;
            --border-subtle: #E5E5E5;
            --border-medium: #D0D0D0;
            --text-primary: #1A1A1A;
            --text-secondary: #4A4A4A;
            --text-muted: #8A8A8A;
            --accent: #E8453C;
            --accent-dim: #E8453C15;
          }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-primary);
          background: var(--surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: 12px;
          padding: 16px;
          width: 100%;
          min-height: 200px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s ease;
        }
        textarea:focus {
          border-color: var(--accent);
        }
        textarea::placeholder {
          color: var(--text-muted);
        }

        .header-tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          background: var(--accent-dim);
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 500;
        }

        .btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn:active { transform: scale(0.97); }
        .btn-primary {
          background: var(--accent);
          color: #fff;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-ghost {
          background: var(--surface-secondary);
          color: var(--text-secondary);
          border: 1.5px solid var(--border-subtle);
        }
        .btn-ghost:hover { border-color: var(--border-medium); color: var(--text-primary); }

        .results-panel {
          background: var(--surface);
          border: 1.5px solid var(--border-subtle);
          border-radius: 14px;
          overflow: hidden;
        }

        .annotated-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          padding: 20px;
          background: var(--surface);
          max-height: 400px;
          overflow-y: auto;
        }

        .fade-in {
          animation: fadeIn 0.4s ease both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stagger-1 { animation-delay: 0.05s; }
        .stagger-2 { animation-delay: 0.1s; }
        .stagger-3 { animation-delay: 0.15s; }
        .stagger-4 { animation-delay: 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="header-tag" style={{ marginBottom: 12 }}>powered by humanizer skill</div>
        <h1 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.2,
          marginBottom: 6,
        }}>
          AI Slop Detector
        </h1>
        <p style={{
          fontSize: 15,
          color: "var(--text-muted)",
          maxWidth: 520,
          lineHeight: 1.5,
        }}>
          Paste any text. See exactly which patterns give away that an AI wrote it.
          Based on Wikipedia's "Signs of AI writing" guide, cataloguing 28 distinct patterns.
        </p>
      </div>

      {/* Input */}
      <div style={{ marginBottom: 20 }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (showResults) setShowResults(true); // live update
          }}
          placeholder="Paste text here to analyze for AI writing patterns..."
          rows={8}
        />
        <div style={{
          display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap",
          alignItems: "center",
        }}>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={!text.trim()}>
            Analyze
          </button>
          <button className="btn btn-ghost" onClick={handleLoadSample}>
            Load sample slop
          </button>
          {text && (
            <button className="btn btn-ghost" onClick={handleClear}>
              Clear
            </button>
          )}
          <span style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "'JetBrains Mono', monospace",
            marginLeft: "auto",
          }}>
            {text.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </div>

      {/* Results */}
      {showResults && text.trim() && (
        <div className="fade-in" style={{
          display: "grid",
          gridTemplateColumns: analysis.findings.length > 0 ? "1fr 320px" : "1fr",
          gap: 20,
          alignItems: "start",
        }}>
          {/* Left: annotated text */}
          <div className="results-panel fade-in stagger-1">
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Annotated text
              </span>
              {activePattern && (
                <button
                  onClick={() => setActivePattern(null)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "var(--accent)",
                    background: "var(--accent-dim)",
                    border: "none",
                    borderRadius: 4,
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}
                >
                  show all
                </button>
              )}
            </div>
            <div className="annotated-text">
              <HighlightedText
                text={text}
                matches={analysis.matches}
                activePattern={activePattern}
              />
            </div>
          </div>

          {/* Right: sidebar */}
          {analysis.findings.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Score */}
              <div className="results-panel fade-in stagger-2" style={{ padding: "8px 16px" }}>
                <ScoreGauge score={analysis.score} />
              </div>

              {/* Patterns found */}
              <div className="results-panel fade-in stagger-3" style={{ padding: 16 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}>
                  Patterns found ({analysis.findings.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {analysis.findings
                    .sort((a, b) => b.count - a.count)
                    .map((f) => (
                      <PatternPill
                        key={f.id}
                        finding={f}
                        isActive={activePattern === f.id}
                        onClick={setActivePattern}
                      />
                    ))}
                </div>
              </div>

              {/* Stats */}
              <div className="results-panel fade-in stagger-4" style={{ padding: 16 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 12,
                }}>
                  Quick stats
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Patterns", value: analysis.findings.length },
                    { label: "Total hits", value: analysis.matches.length },
                    { label: "Words", value: text.split(/\s+/).filter(Boolean).length },
                    { label: "Em dashes", value: (text.match(/\u2014|--/g) || []).length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: "var(--surface-secondary)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 20, fontWeight: 700,
                        color: "var(--text-primary)",
                      }}>
                        {value}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {analysis.findings.length === 0 && (
            <div className="results-panel fade-in stagger-2" style={{
              padding: 40, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 18, fontWeight: 700,
                color: "#4ADE80",
                marginBottom: 8,
              }}>
                Clean
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                No AI writing patterns detected. This text reads like a human wrote it.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 40,
        paddingTop: 20,
        borderTop: "1px solid var(--border-subtle)",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.02em",
        }}>
          28 patterns tracked from Wikipedia's "Signs of AI writing" guide
          &nbsp;&middot;&nbsp; regex-based local analysis &nbsp;&middot;&nbsp; nothing leaves your browser
        </p>
      </div>
    </div>
  );
}
