import { useState, useCallback, useRef } from "react";

const AI_PATTERNS = [
  {
    id: "significance", name: "Inflated significance",
    desc: "\"pivotal moment\", \"testament\", \"vital role\"",
    regex: /\b(stands?\s+as|serves?\s+as|is\s+a\s+testament|enduring\s+testament|pivotal\s+moment|vital\s+role|significant\s+role|crucial\s+role|key\s+(role|moment|turning\s+point)|underscores?|highlights?\s+(its|the)\s+importance|reflects?\s+broader|symboliz(es?|ing)\s+(its|the)|setting\s+the\s+stage|marking\s+a|shaping\s+the|indelible\s+mark|deeply\s+rooted|evolving\s+landscape|focal\s+point)\b/gi,
    color: "#EF4444", bg: "#FEF2F2",
  },
  {
    id: "promotional", name: "Promotional language",
    desc: "\"nestled\", \"vibrant\", \"breathtaking\"",
    regex: /\b(boasts?\s+a|vibrant|profound|showcas(es?|ing)|exemplif(ies|y)|commitment\s+to|natural\s+beauty|nestled|in\s+the\s+heart\s+of|groundbreaking|renowned|breathtaking|must-visit|stunning)\b/gi,
    color: "#F97316", bg: "#FFF7ED",
  },
  {
    id: "ai_vocab", name: "AI vocabulary",
    desc: "\"delve\", \"landscape\", \"tapestry\", \"foster\"",
    regex: /\b(additionally|align\s+with|crucial|delve|emphasizing|enduring|enhance[ds]?|fostering|garner(s|ed)?|interplay|intricac(ies|y)|intricate|landscape|pivotal|tapestry|testament|underscore[ds]?|valuable|vibrant)\b/gi,
    color: "#EAB308", bg: "#FEFCE8",
  },
  {
    id: "ing_phrases", name: "-ing phrases",
    desc: "\"highlighting...\", \"ensuring...\", \"reflecting...\"",
    regex: /,?\s*(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing\s+to|cultivating|fostering|encompassing|showcasing)\s+/gi,
    color: "#22C55E", bg: "#F0FDF4",
  },
  {
    id: "copula_avoidance", name: "Copula avoidance",
    desc: "\"serves as\" instead of just \"is\"",
    regex: /\b(serves?\s+as|stands?\s+as|marks?\s+a|represents?\s+a|boasts?\s+|features?\s+a|offers?\s+a)\b/gi,
    color: "#3B82F6", bg: "#EFF6FF",
  },
  {
    id: "negative_parallelism", name: "Negative parallelisms",
    desc: "\"it's not just X; it's Y\"",
    regex: /\b(not\s+only\s+.{1,40}but\s+(also)?|it'?s\s+not\s+just\s+about|not\s+merely|no\s+guessing|no\s+wasted)\b/gi,
    color: "#A855F7", bg: "#FAF5FF",
  },
  {
    id: "rule_of_three", name: "Rule of three",
    desc: "forced triplets everywhere",
    regex: /\b(\w+),\s+(\w+),\s+and\s+(\w+)\b/gi,
    color: "#EC4899", bg: "#FDF2F8",
  },
  {
    id: "chatbot_artifacts", name: "Chatbot artifacts",
    desc: "\"Great question!\", \"I hope this helps!\"",
    regex: /\b(I\s+hope\s+this\s+helps|of\s+course!|certainly!|you'?re\s+absolutely\s+right|would\s+you\s+like|let\s+me\s+know|here\s+is\s+a|great\s+question|let'?s\s+dive\s+in|let'?s\s+explore|let'?s\s+break\s+this\s+down|here'?s\s+what\s+you\s+need\s+to\s+know|without\s+further\s+ado)\b/gi,
    color: "#14B8A6", bg: "#F0FDFA",
  },
  {
    id: "em_dashes", name: "Em dash overuse",
    desc: "most can be commas or periods",
    regex: /\u2014|--/g,
    color: "#E11D48", bg: "#FFF1F2",
  },
  {
    id: "hedging", name: "Excessive hedging",
    desc: "\"could potentially possibly be argued\"",
    regex: /\b(could\s+potentially|it\s+could\s+be\s+argued|might\s+potentially|it\s+is\s+worth\s+noting|it\s+is\s+important\s+to\s+note)\b/gi,
    color: "#8B5CF6", bg: "#F5F3FF",
  },
  {
    id: "filler", name: "Filler phrases",
    desc: "\"in order to\", \"due to the fact that\"",
    regex: /\b(in\s+order\s+to|due\s+to\s+the\s+fact\s+that|at\s+this\s+point\s+in\s+time|in\s+the\s+event\s+that|has\s+the\s+ability\s+to|it\s+is\s+important\s+to\s+note\s+that|in\s+today'?s\s+rapidly)\b/gi,
    color: "#10B981", bg: "#ECFDF5",
  },
  {
    id: "generic_conclusion", name: "Generic endings",
    desc: "\"the future looks bright\"",
    regex: /\b(the\s+future\s+looks\s+bright|exciting\s+times\s+(lie|lay)\s+ahead|continue\s+(this|their|our)\s+journey|a\s+(major\s+)?step\s+in\s+the\s+right\s+direction|paving\s+the\s+way)\b/gi,
    color: "#F59E0B", bg: "#FFFBEB",
  },
  {
    id: "false_ranges", name: "False ranges",
    desc: "\"from X to Y, from A to B\"",
    regex: /from\s+\w[\w\s]{1,30}\s+to\s+\w[\w\s]{1,30},\s*from\s+/gi,
    color: "#D97706", bg: "#FEF3C7",
  },
  {
    id: "vague_attribution", name: "Vague attributions",
    desc: "\"experts argue\", \"industry reports\"",
    regex: /\b(industry\s+reports|observers?\s+have\s+(cited|noted)|experts?\s+(argue|believe|say)|some\s+critics\s+argue|several\s+sources)\b/gi,
    color: "#0EA5E9", bg: "#F0F9FF",
  },
  {
    id: "signposting", name: "Signposting",
    desc: "\"let's dive in\", \"here's what you need to know\"",
    regex: /\b(let'?s\s+dive\s+in(to)?|let'?s\s+explore|let'?s\s+break\s+this\s+down|here'?s\s+what\s+you\s+need\s+to\s+know|now\s+let'?s\s+look\s+at|without\s+further\s+ado)\b/gi,
    color: "#6366F1", bg: "#EEF2FF",
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
      findings.push({ ...pattern, count: matches.length });
      matches.forEach((m) => {
        allMatches.push({
          start: m.index, end: m.index + m[0].length,
          patternId: pattern.id, color: pattern.color, bg: pattern.bg, text: m[0],
        });
      });
    }
  });
  allMatches.sort((a, b) => a.start - b.start);
  const cleaned = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.start >= lastEnd) { cleaned.push(m); lastEnd = m.end; }
  }
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const matchedWords = cleaned.reduce((s, m) => s + m.text.split(/\s+/).filter(Boolean).length, 0);
  const slopRatio = wordCount > 0 ? matchedWords / wordCount : 0;
  let score = Math.min(100, Math.round(slopRatio * 400 + findings.length * 4));
  return { matches: cleaned, score, findings };
}

function getVerdict(score) {
  if (score === 0) return { label: "Clean", desc: "No AI patterns found. You're good.", grad: "135deg, #22C55E, #10B981" };
  if (score < 15) return { label: "Mostly human", desc: "A couple tells. Nothing alarming.", grad: "135deg, #22C55E, #84CC16" };
  if (score < 35) return { label: "Suspicious", desc: "An editor would catch these.", grad: "135deg, #EAB308, #F59E0B" };
  if (score < 60) return { label: "Likely AI", desc: "Multiple patterns. Reads like chatbot output.", grad: "135deg, #F97316, #EF4444" };
  if (score < 80) return { label: "AI slop", desc: "Classic LLM writing. Heavy pattern density.", grad: "135deg, #EF4444, #E11D48" };
  return { label: "Pure slop", desc: "Textbook AI writing. Every pattern present.", grad: "135deg, #E11D48, #9F1239" };
}

function HighlightedText({ text, matches, activePattern }) {
  if (!matches.length) return <span>{text}</span>;
  const parts = [];
  let lastIdx = 0;
  matches.forEach((m, i) => {
    if (m.start > lastIdx) parts.push(<span key={`t-${i}`}>{text.slice(lastIdx, m.start)}</span>);
    const isActive = !activePattern || activePattern === m.patternId;
    parts.push(
      <span key={`m-${i}`} style={{
        backgroundColor: isActive ? m.bg : "transparent",
        color: isActive ? m.color : "#C4B5A0",
        fontWeight: isActive ? 600 : 400,
        borderRadius: 4, padding: "2px 4px",
        transition: "all 0.2s ease",
        textDecoration: isActive ? `underline wavy ${m.color}40` : "none",
        textUnderlineOffset: "4px",
      }}>{text.slice(m.start, m.end)}</span>
    );
    lastIdx = m.end;
  });
  if (lastIdx < text.length) parts.push(<span key="last">{text.slice(lastIdx)}</span>);
  return <>{parts}</>;
}

function ScoreDisplay({ score }) {
  const verdict = getVerdict(score);
  const r = 58;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "8px 0" }}>
      <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#E8E0D4" strokeWidth="8" />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={verdict.grad.split(", ")[1]} />
              <stop offset="100%" stopColor={verdict.grad.split(", ")[2]} />
            </linearGradient>
          </defs>
          <circle
            cx="65" cy="65" r={r} fill="none"
            stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center",
        }}>
          <div style={{
            fontSize: 36, fontWeight: 800,
            fontFamily: "'Bricolage Grotesque', sans-serif",
            background: `linear-gradient(${verdict.grad})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}>{score}</div>
        </div>
      </div>
      <div>
        <div style={{
          fontSize: 18, fontWeight: 700,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          background: `linear-gradient(${verdict.grad})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 4,
        }}>{verdict.label}</div>
        <div style={{ fontSize: 13, color: "#8A7E6D", lineHeight: 1.5 }}>{verdict.desc}</div>
      </div>
    </div>
  );
}

function PatternCard({ finding, isActive, onClick }) {
  return (
    <button onClick={() => onClick(isActive ? null : finding.id)} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 12, width: "100%", textAlign: "left",
      border: isActive ? `2px solid ${finding.color}` : "2px solid transparent",
      background: isActive ? finding.bg : "#FAF6F0",
      cursor: "pointer", transition: "all 0.2s ease",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      boxShadow: isActive ? `0 2px 12px ${finding.color}20` : "none",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `linear-gradient(135deg, ${finding.color}20, ${finding.color}40)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 14, fontWeight: 800,
        color: finding.color, fontFamily: "'Fira Code', monospace",
      }}>{finding.count}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2D2419" }}>{finding.name}</div>
        <div style={{
          fontSize: 11, color: "#A0937E", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{finding.desc}</div>
      </div>
    </button>
  );
}

export default function SlopDetector() {
  const [text, setText] = useState("");
  const [activePattern, setActivePattern] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef(null);
  const analysis = analyzeText(text);

  const handleAnalyze = useCallback(() => { if (text.trim()) setShowResults(true); }, [text]);
  const handleLoadSample = useCallback(() => { setText(SAMPLE_TEXT); setShowResults(true); setActivePattern(null); }, []);
  const handleClear = useCallback(() => { setText(""); setShowResults(false); setActivePattern(null); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FDF9F3 0%, #F5EDE0 100%)",
      color: "#2D2419",
      fontFamily: "'Bricolage Grotesque', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        textarea {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; line-height: 1.75; color: #2D2419;
          background: #FFFFFF; border: 2px solid #E8E0D4;
          border-radius: 16px; padding: 20px; width: 100%;
          min-height: 180px; resize: vertical; outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          box-shadow: 0 1px 3px rgba(45,36,25,0.04);
        }
        textarea:focus {
          border-color: #D4C4AE;
          box-shadow: 0 0 0 4px rgba(212,196,174,0.3), 0 2px 8px rgba(45,36,25,0.06);
        }
        textarea::placeholder { color: #C4B5A0; }

        .btn {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 14px; font-weight: 700; border: none;
          border-radius: 12px; padding: 11px 24px; cursor: pointer;
          transition: all 0.2s ease; letter-spacing: -0.01em;
        }
        .btn:active { transform: scale(0.96); }

        .btn-main {
          background: linear-gradient(135deg, #2D2419, #4A3D2E);
          color: #FDF9F3;
          box-shadow: 0 2px 8px rgba(45,36,25,0.2);
        }
        .btn-main:hover { box-shadow: 0 4px 16px rgba(45,36,25,0.3); transform: translateY(-1px); }
        .btn-main:disabled { opacity: 0.3; cursor: default; transform: none; box-shadow: none; }

        .btn-sec {
          background: #FFFFFF; color: #6B5D4D;
          border: 2px solid #E8E0D4;
        }
        .btn-sec:hover { border-color: #D4C4AE; color: #2D2419; background: #FFF; }

        .card {
          background: #FFFFFF;
          border: 2px solid #EDE6DA;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(45,36,25,0.04);
        }

        .text-view {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; line-height: 1.9;
          white-space: pre-wrap; word-wrap: break-word;
          padding: 24px; max-height: 460px; overflow-y: auto;
          color: #4A3D2E;
        }
        .text-view::-webkit-scrollbar { width: 5px; }
        .text-view::-webkit-scrollbar-track { background: transparent; }
        .text-view::-webkit-scrollbar-thumb { background: #D4C4AE; border-radius: 5px; }

        .up { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.19s; }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 28px 48px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'Fira Code', monospace", fontSize: 11,
            fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "#FDF9F3", borderRadius: 8, padding: "5px 12px", marginBottom: 14,
            background: "linear-gradient(135deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #A855F7)",
            backgroundSize: "300% 300%",
            animation: "gradientShift 6s ease infinite",
          }}>
            pattern detector
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em",
            color: "#2D2419", lineHeight: 1.15, marginBottom: 10,
          }}>
            Is it slop?
          </h1>
          <p style={{
            fontSize: 16, color: "#8A7E6D", lineHeight: 1.6, maxWidth: 480, fontWeight: 400,
          }}>
            LLMs write in patterns. Always the same ones. Paste any text and
            see which tells show up. 15 categories, runs locally, nothing leaves your browser.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 28 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); if (showResults) setShowResults(true); }}
            placeholder="paste text here..."
            rows={7}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-main" onClick={handleAnalyze} disabled={!text.trim()}>
              Analyze
            </button>
            <button className="btn btn-sec" onClick={handleLoadSample}>Load sample</button>
            {text && <button className="btn btn-sec" onClick={handleClear}>Clear</button>}
            <span style={{
              fontSize: 12, color: "#B5A898", fontFamily: "'Fira Code', monospace", marginLeft: "auto",
            }}>
              {text.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        {/* Results */}
        {showResults && text.trim() && (
          <div className="up" style={{
            display: "grid",
            gridTemplateColumns: analysis.findings.length > 0 ? "1fr 320px" : "1fr",
            gap: 20, alignItems: "start",
          }}>
            {/* Annotated text */}
            <div className="card up d1">
              <div style={{
                padding: "12px 24px", borderBottom: "2px solid #EDE6DA",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 11, fontWeight: 600, color: "#B5A898",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>annotated</span>
                {activePattern && (
                  <button onClick={() => setActivePattern(null)} style={{
                    fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600,
                    color: "#EF4444", background: "#FEF2F2",
                    border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                  }}>show all</button>
                )}
              </div>
              <div className="text-view">
                <HighlightedText text={text} matches={analysis.matches} activePattern={activePattern} />
              </div>
            </div>

            {/* Sidebar */}
            {analysis.findings.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Score */}
                <div className="card up d1" style={{ padding: "16px 24px" }}>
                  <ScoreDisplay score={analysis.score} />
                </div>

                {/* Stats row */}
                <div className="up d2" style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "patterns", value: analysis.findings.length, color: "#3B82F6", bg: "#EFF6FF" },
                    { label: "total hits", value: analysis.matches.length, color: "#EF4444", bg: "#FEF2F2" },
                    { label: "words", value: text.split(/\s+/).filter(Boolean).length, color: "#22C55E", bg: "#F0FDF4" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{
                      flex: 1, background: bg, borderRadius: 12,
                      padding: "14px 12px", textAlign: "center",
                      border: `1.5px solid ${color}20`,
                    }}>
                      <div style={{
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 22, fontWeight: 700, color: color,
                      }}>{value}</div>
                      <div style={{ fontSize: 10, color: "#A0937E", marginTop: 3, fontWeight: 500 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Pattern cards */}
                <div className="card up d3" style={{ padding: "16px 12px" }}>
                  <div style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 10, fontWeight: 600, color: "#B5A898",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    padding: "0 12px", marginBottom: 10,
                  }}>
                    detected ({analysis.findings.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {analysis.findings
                      .sort((a, b) => b.count - a.count)
                      .map((f) => (
                        <PatternCard
                          key={f.id} finding={f}
                          isActive={activePattern === f.id}
                          onClick={setActivePattern}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {analysis.findings.length === 0 && (
              <div className="card up d2" style={{ padding: "56px 24px", textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #22C55E20, #10B98130)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 24, color: "#22C55E",
                }}>&#10003;</div>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: "#22C55E", marginBottom: 6,
                }}>Clean</div>
                <div style={{ fontSize: 14, color: "#8A7E6D" }}>No AI patterns detected.</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 56, paddingTop: 20,
          borderTop: "2px solid #EDE6DA",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 8,
        }}>
          <span style={{ fontSize: 12, color: "#C4B5A0", fontFamily: "'Fira Code', monospace" }}>
            client-side regex analysis
          </span>
          <a
            href="https://github.com/monali7-d/ai-slop-detector"
            target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "#8A7E6D", fontFamily: "'Fira Code', monospace",
              textDecoration: "none", fontWeight: 500,
              padding: "4px 12px", borderRadius: 8, background: "#FAF6F0",
              border: "1.5px solid #EDE6DA", transition: "all 0.2s",
            }}
          >github</a>
        </div>
      </div>
    </div>
  );
}
