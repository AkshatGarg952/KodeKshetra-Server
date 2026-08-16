import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_EMAIL, SERVER_URL } from "./config.js";

async function parseResponse(response) {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      message: "Server returned a non-JSON response",
      details: {
        rawText,
      },
    };
  }
}

function DetailBlock({ title, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
        {title}
      </p>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{String(value)}</span>
    </div>
  );
}

function AdminImporterPage() {
  const navigate = useNavigate();
  const userEmail = (sessionStorage.getItem("userEmail") || "").toLowerCase();
  const token = sessionStorage.getItem("token");
  const [formData, setFormData] = useState({
    url: "",
    language: "python",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  useEffect(() => {
    if (userEmail !== ADMIN_EMAIL) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, userEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/admin/importProblem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: formData.url.trim(),
          solution: {
            language: formData.language,
            code: formData.code,
          },
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        setError({
          statusCode: response.status,
          message: data.message || "Import failed",
          stage: data.stage || "unknown",
          requestId: data.requestId || null,
          details: data.details || null,
        });
        return;
      }

      setResult(data);
      setFormData((prev) => ({
        ...prev,
        url: "",
        code: "",
      }));
    } catch (submissionError) {
      setError({
        statusCode: "NETWORK",
        message: submissionError.message || "Failed to reach the import endpoint",
        stage: "client-request",
        requestId: null,
        details: {
          serverUrl: SERVER_URL,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_32%)]" />

      <div className="relative z-10">
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/75">
                Admin Importer
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Import problems with traceable failures
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Paste a Codeforces or LeetCode URL, provide the reference solution, and this screen will surface both success
                details and structured import failures from the backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Import Request</h2>
                <p className="mt-2 text-sm text-slate-400">
                  The backend validates samples first, then generates hidden tests, then persists the question and solution.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs font-medium text-amber-100">
                Supported languages: Python, C++, Java
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Signed in as <span className="font-semibold">{userEmail || ADMIN_EMAIL}</span>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Problem URL</span>
                <input
                  type="url"
                  value={formData.url}
                  onChange={handleChange("url")}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                  placeholder="https://codeforces.com/problemset/problem/..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Solution language</span>
                <select
                  value={formData.language}
                  onChange={handleChange("language")}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Reference solution</span>
                <textarea
                  value={formData.code}
                  onChange={handleChange("code")}
                  required
                  rows={18}
                  className="min-h-[360px] w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                  placeholder="Paste the accepted solution here..."
                />
              </label>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-400">
                  Failure responses include the request ID and stage so you can match UI failures with server logs quickly.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Importing..." : "Start Import"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
                Import flow
              </p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                <p>1. Detect the platform from the URL and scrape the problem payload.</p>
                <p>2. Validate the provided solution against samples through Code Runner.</p>
                <p>3. Generate hidden inputs through HiddenForces, compute outputs, then persist everything in MongoDB.</p>
              </div>
            </section>

            {error ? (
              <section className="rounded-[28px] border border-rose-400/30 bg-rose-950/40 p-6 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/80">
                  Import failed
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">{error.message}</h3>
                <div className="mt-5 space-y-3">
                  <ResultRow label="Stage" value={error.stage || "unknown"} />
                  <ResultRow label="Request ID" value={error.requestId || "not provided"} />
                  <ResultRow label="Status" value={error.statusCode || "unknown"} />
                </div>
                <div className="mt-5">
                  <DetailBlock title="Details" value={error.details} />
                </div>
              </section>
            ) : null}

            {result ? (
              <section className="rounded-[28px] border border-emerald-400/30 bg-emerald-950/30 p-6 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                  Import succeeded
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">{result.title}</h3>
                <div className="mt-5 space-y-3">
                  <ResultRow label="Platform" value={result.platform} />
                  <ResultRow label="Problem ID" value={result.problemId} />
                  <ResultRow label="Hidden tests" value={result.hiddenTestsGenerated} />
                  <ResultRow label="Request ID" value={result.requestId} />
                </div>
                <div className="mt-5">
                  <DetailBlock title="Response" value={result} />
                </div>
              </section>
            ) : (
              <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                  Response panel
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Successful imports will show the normalized outcome here. Failed imports will show the request ID, stage,
                  and structured backend details so you can diagnose the exact failing step.
                </p>
              </section>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

export default AdminImporterPage;
