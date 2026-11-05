import { useState } from "react";
import { CheckCircle2, Plus, Upload } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, Notice, SelectField, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const blank = () => ({ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "", published: true });
const numberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

export function QuizSettings({ topic, quiz, onSaved }) {
  const [form, setForm] = useState(() => ({
    title: quiz?.title || `${topic.title} quiz`, passMark: quiz?.passMark ?? 60,
    questionsPerAttempt: quiz?.questionsPerAttempt ?? "", timeLimitMinutes: quiz?.timeLimitMinutes ?? "",
    maxAttempts: quiz?.maxAttempts ?? "", randomizeQuestions: quiz?.randomizeQuestions ?? true,
    showExplanations: quiz?.showExplanations || "after_submit", published: quiz?.published ?? false,
  }));
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await api.put(`/admin/topics/${topic.id}/quiz`, {
        title: form.title.trim(), passMark: Number(form.passMark), questionsPerAttempt: numberOrNull(form.questionsPerAttempt),
        timeLimitMinutes: numberOrNull(form.timeLimitMinutes), maxAttempts: numberOrNull(form.maxAttempts),
        randomizeQuestions: form.randomizeQuestions, showExplanations: form.showExplanations, published: form.published,
      });
      setNotice({ tone: "info", text: quiz ? "Quiz settings saved." : "Quiz created. Now add questions." });
      onSaved();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="ui-card ui-form" onSubmit={save} noValidate>
      <h2>{quiz ? "Quiz settings" : "Create a quiz for this topic"}</h2>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <TextField label="Quiz title" value={form.title} onChange={set("title")} />
      <div className="ui-form-grid">
        <TextField label="Pass mark (%)" type="number" inputMode="numeric" min="0" max="100" value={form.passMark} onChange={set("passMark")} />
        <TextField label="Questions per attempt" type="number" inputMode="numeric" min="1" value={form.questionsPerAttempt} onChange={set("questionsPerAttempt")} hint="Empty = all published questions." />
        <TextField label="Time limit (minutes)" type="number" inputMode="numeric" min="1" value={form.timeLimitMinutes} onChange={set("timeLimitMinutes")} hint="Empty = no timer." />
        <TextField label="Maximum attempts" type="number" inputMode="numeric" min="1" value={form.maxAttempts} onChange={set("maxAttempts")} hint="Empty = unlimited." />
      </div>
      <SelectField label="Explanations" value={form.showExplanations} onChange={set("showExplanations")} options={[
        { value: "after_submit", label: "Show answers and explanations after submitting" },
        { value: "immediately", label: "Show after each question" },
        { value: "never", label: "Never show answers (score only)" },
      ]} />
      <CheckboxField label="Randomize questions" hint="Each attempt gets questions in a different order (and a different selection when limited)." checked={form.randomizeQuestions} onChange={set("randomizeQuestions")} />
      <CheckboxField label="Published" hint="Students can take published quizzes that have at least one published question." checked={form.published} onChange={set("published")} />
      <div className="ui-form-actions"><Button type="submit" loading={saving}>{quiz ? "Save settings" : "Create quiz"}</Button></div>
    </form>
  );
}

function QuestionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => initial || blank());
  const [error, setError] = useState("");
  const setOption = (index, value) => setForm((current) => ({ ...current, options: current.options.map((option, i) => (i === index ? value : option)) }));
  function submit(event) {
    event.preventDefault();
    const options = form.options.map((option) => option.trim());
    const filled = options.filter(Boolean);
    if (form.question.trim().length < 5) return setError("Write the question (at least 5 characters).");
    if (filled.length < 2) return setError("Provide at least two answer options.");
    if (!options[form.correctAnswer]) return setError("Choose which filled-in option is correct.");
    const kept = options.map((option, index) => ({ option, index })).filter((item) => item.option);
    const correctAnswer = kept.findIndex((item) => item.index === form.correctAnswer);
    setError("");
    onSave({ question: form.question.trim(), options: kept.map((item) => item.option), correctAnswer, explanation: form.explanation.trim(), published: form.published });
  }
  return (
    <form className="ui-form question-form" onSubmit={submit} noValidate>
      <TextArea label="Question" rows={2} value={form.question} onChange={(question) => setForm((f) => ({ ...f, question }))} />
      <fieldset className="question-options">
        <legend>Answer options (select the correct one)</legend>
        {form.options.map((option, index) => (
          <div className="question-option-row" key={index}>
            <input type="radio" name="correct" aria-label={`Option ${LETTERS[index]} is correct`} checked={form.correctAnswer === index} onChange={() => setForm((f) => ({ ...f, correctAnswer: index }))} />
            <input className="ui-input" aria-label={`Option ${LETTERS[index]}`} placeholder={`Option ${LETTERS[index]}`} value={option} onChange={(event) => setOption(index, event.target.value)} />
          </div>
        ))}
        {form.options.length < 6 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm((f) => ({ ...f, options: [...f.options, ""] }))}><Plus size={15} aria-hidden="true" /> Add option</button>}
      </fieldset>
      <TextArea label="Explanation (optional)" rows={2} value={form.explanation} onChange={(explanation) => setForm((f) => ({ ...f, explanation }))} />
      <CheckboxField label="Published" checked={form.published} onChange={(published) => setForm((f) => ({ ...f, published }))} />
      {error && <p className="field-error">{error}</p>}
      <div className="ui-form-actions">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={saving}>Save question</Button>
      </div>
    </form>
  );
}

function ImportPanel({ quizId, onImported }) {
  const [content, setContent] = useState("");
  const [format, setFormat] = useState("csv");
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function readFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFormat(/\.json$/i.test(file.name) ? "json" : "csv");
    setContent(await file.text());
    setReport(null);
  }
  async function send(dryRun) {
    setBusy(true);
    setError("");
    try {
      const result = await api.post(`/admin/quizzes/${quizId}/questions/import`, { format, content, dryRun }, "report");
      setReport(result);
      if (!dryRun) {
        onImported();
        setContent("");
      }
    } catch (importError) {
      setError(importError.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ui-form import-panel">
      <p className="ui-hint">
        CSV columns: <code className="inline-code">question, option_a, option_b, option_c, option_d, correct_answer, explanation</code> (correct_answer is A–D).
        JSON: <code className="inline-code">[{"{"}"question", "options": [...], "correctAnswer": 0, "explanation"{"}"}]</code>. Up to 500 questions at a time.
      </p>
      <div className="ui-toolbar">
        <SelectField label="Format" value={format} onChange={setFormat} options={[{ value: "csv", label: "CSV" }, { value: "json", label: "JSON" }]} />
        <label className="btn btn-outline ui-toolbar-fixed"><Upload size={16} aria-hidden="true" /> Choose file<input type="file" accept=".csv,.json,text/csv,application/json" className="sr-only" onChange={readFile} /></label>
      </div>
      <TextArea label="Or paste the questions" rows={6} value={content} onChange={(value) => { setContent(value); setReport(null); }} />
      {error && <p className="field-error">{error}</p>}
      <div className="ui-form-actions">
        <Button type="button" variant="outline" disabled={!content.trim() || busy} onClick={() => send(true)}>Check file</Button>
        <Button type="button" disabled={!content.trim() || busy || (report?.dryRun && report.ready === 0)} onClick={() => send(false)}>
          {report?.dryRun ? `Import ${report.ready} valid question${report.ready === 1 ? "" : "s"}` : "Import"}
        </Button>
      </div>
      {report && (
        <div className="import-report" role="status">
          <p><strong>{report.dryRun ? "Check complete" : "Import complete"}:</strong> {report.totalRows} rows · {report.dryRun ? `${report.ready} ready to import` : `${report.imported} imported`} · {report.failed.length} with errors · {report.duplicates.length} duplicates</p>
          {report.failed.length > 0 && (
            <details open><summary>Rows with errors ({report.failed.length})</summary>
              <ul>{report.failed.map((row) => <li key={`f${row.row}`}><strong>Row {row.row}</strong>{row.question ? ` (“${row.question.slice(0, 60)}”)` : ""}: {row.errors.join(" ")}</li>)}</ul>
            </details>
          )}
          {report.duplicates.length > 0 && (
            <details><summary>Duplicates skipped ({report.duplicates.length})</summary>
              <ul>{report.duplicates.map((row) => <li key={`d${row.row}`}><strong>Row {row.row}</strong>: {row.reason}</li>)}</ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionBank({ quiz, onChanged }) {
  const [search, setSearch] = useState("");
  const { data: questions, loading, error, reload } = useApiResource(`/admin/quizzes/${quiz.id}/questions`, "questions");
  const [editing, setEditing] = useState(null);
  const [panel, setPanel] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const refresh = () => { reload(); onChanged(); };

  async function save(body, id) {
    setSaving(true);
    setNotice(null);
    try {
      if (id) await api.patch(`/admin/questions/${id}`, body);
      else await api.post(`/admin/quizzes/${quiz.id}/questions`, body);
      setEditing(null);
      setPanel("");
      setNotice({ tone: "info", text: "Question saved." });
      refresh();
    } catch (saveError) {
      setNotice({ tone: "error", text: saveError.message });
    } finally {
      setSaving(false);
    }
  }

  const term = search.trim().toLowerCase();
  const shown = questions.filter((item) => !term || item.question.toLowerCase().includes(term));
  return (
    <section className="ui-card">
      <div className="ui-card-header">
        <h2>Question bank ({questions.length})</h2>
        <div className="ui-actions">
          <Button variant="outline" onClick={() => setPanel(panel === "add" ? "" : "add")}><Plus size={16} aria-hidden="true" /> Add question</Button>
          <Button variant="outline" onClick={() => setPanel(panel === "import" ? "" : "import")}><Upload size={16} aria-hidden="true" /> Bulk import</Button>
        </div>
      </div>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      {panel === "add" && <QuestionForm onSave={(body) => save(body)} onCancel={() => setPanel("")} saving={saving} />}
      {panel === "import" && <ImportPanel quizId={quiz.id} onImported={refresh} />}
      <TextField label="Search questions" type="search" value={search} onChange={setSearch} />
      {loading ? <Loader label="Loading questions…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : shown.length === 0 ? <p className="muted-text">No questions yet.</p> : (
        <ol className="question-list">
          {shown.map((item) => (
            <li key={item.id} className="question-item">
              {editing === item.id ? (
                <QuestionForm initial={{ ...item, options: [...item.options] }} onSave={(body) => save(body, item.id)} onCancel={() => setEditing(null)} saving={saving} />
              ) : (
                <>
                  <div className="question-item-head">
                    <strong>{item.question}</strong>
                    {!item.published && <span className="ui-pill amber">Hidden</span>}
                  </div>
                  <ul className="question-item-options">
                    {item.options.map((option, index) => (
                      <li key={index} className={index === item.correctAnswer ? "correct" : ""}>
                        {LETTERS[index]}. {option} {index === item.correctAnswer && <CheckCircle2 size={14} aria-label="Correct answer" />}
                      </li>
                    ))}
                  </ul>
                  {item.explanation && <p className="muted-text">{item.explanation}</p>}
                  <div className="ui-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(item.id)}>Edit</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => save({ published: !item.published }, item.id)}>{item.published ? "Hide" : "Publish"}</button>
                    <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={async () => {
                      if (!window.confirm("Delete this question? Past attempts keep their own copy.")) return;
                      try { await api.delete(`/admin/questions/${item.id}`); refresh(); } catch (deleteError) { setNotice({ tone: "error", text: deleteError.message }); }
                    }}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
