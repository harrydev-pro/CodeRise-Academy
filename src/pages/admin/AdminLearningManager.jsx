import { useMemo, useState } from "react";
import { BookOpen, ClipboardCheck, Plus, Save, Trash2 } from "lucide-react";
import { initialLessons } from "../../data/initialLessons";
import { initialTracks } from "../../data/initialTracks";
import { getLessons, saveLessons } from "../../features/free-learning/lessonService";
import { getQuizzes, saveQuizForLesson, saveQuizzes } from "../../features/assessments/quizService";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";

const blankQuestion = () => ({ id: `question-${Date.now()}-${Math.random().toString(16).slice(2)}`, question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" });
const titleCase = (value) => value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminLearningManager({ type }) {
  const isQuiz = type === "quizzes";
  const [, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const tracks = readStore(STORAGE_KEYS.tracks, initialTracks);
  const lessons = readStore(STORAGE_KEYS.lessons, initialLessons);
  const safeLessons = Array.isArray(lessons) ? lessons : initialLessons;
  const quizzes = getQuizzes();
  const [lessonId, setLessonId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [instructions, setInstructions] = useState("Read each question carefully. Choose one answer, or skip and return before submitting.");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [message, setMessage] = useState("");
  const currentLessons = useMemo(() => safeLessons.filter((lesson) => !search || `${lesson.title} ${lesson.trackId}`.toLowerCase().includes(search.toLowerCase())), [safeLessons, search]);
  const currentQuizzes = useMemo(() => quizzes.filter((quiz) => !search || `${quiz.title} ${quiz.lessonId}`.toLowerCase().includes(search.toLowerCase())), [quizzes, search]);

  function resetForm() {
    setEditingId(""); setLessonId(""); setTrackId(""); setTitle(""); setDescription(""); setContent("");
    setInstructions("Read each question carefully. Choose one answer, or skip and return before submitting.");
    setDurationMinutes(10); setPublished(false); setQuestions([blankQuestion()]); setMessage("");
  }
  function editLesson(lesson) {
    setEditingId(lesson.id); setTrackId(lesson.trackId || ""); setTitle(lesson.title || ""); setDescription(lesson.description || "");
    setContent(typeof lesson.content === "string" ? lesson.content : ""); setPublished(Boolean(lesson.published)); setMessage("");
  }
  function editQuiz(quiz) {
    setEditingId(quiz.id); setLessonId(quiz.lessonId || ""); setTitle(quiz.title || ""); setPublished(Boolean(quiz.published));
    setInstructions(Array.isArray(quiz.instructions) ? quiz.instructions.join("\n") : quiz.instructions || "");
    setDurationMinutes(Number(quiz.durationMinutes) || 10);
    setQuestions(quiz.questions?.length ? quiz.questions.map((item) => ({ ...item, options: [...(item.options || ["", "", "", ""])] })) : [blankQuestion()]); setMessage("");
  }
  function saveLesson(event) {
    event.preventDefault();
    if (!title.trim() || !trackId) return setMessage("Add a lesson title and choose a learning track.");
    const current = getLessons();
    const lesson = { id: editingId || `lesson-${Date.now()}`, trackId, title: title.trim(), description: description.trim(), content, duration: "15 minutes", type: "lesson", published, order: current.filter((item) => item.trackId === trackId).length + 1 };
    saveLessons(editingId ? current.map((item) => item.id === editingId ? { ...item, ...lesson } : item) : [...current, lesson]);
    resetForm(); setRefresh((value) => value + 1);
  }
  function saveQuiz(event) {
    event.preventDefault();
    const lesson = safeLessons.find((item) => item.id === lessonId);
    const validQuestions = questions.filter((item) => item.question.trim() && item.options.filter((option) => option.trim()).length >= 2);
    if (!lesson || !title.trim() || !validQuestions.length) return setMessage("Choose a lesson, add a quiz title, and enter at least one question with two answers.");
    const otherQuiz = quizzes.find((item) => item.lessonId === lessonId && item.id !== editingId);
    if (otherQuiz) return setMessage("This lesson already has a quiz. Edit the existing quiz to keep one quiz per lesson.");
    saveQuizForLesson({ id: editingId || undefined, lessonId, trackId: lesson.trackId, title: title.trim(), instructions: instructions.split("\n").map((line) => line.trim()).filter(Boolean), durationMinutes: Math.max(1, Number(durationMinutes) || 10), published, passMark: 60, questions: validQuestions.map((item) => { const options = item.options.map((option) => option.trim()).filter(Boolean); const correctText = item.options[item.correctAnswer]?.trim(); return { ...item, options, correctAnswer: Math.max(options.indexOf(correctText), 0) }; }) });
    resetForm(); setRefresh((value) => value + 1);
  }
  function removeLesson(id) {
    if (!window.confirm("Delete this lesson? Its linked quiz will also be removed.")) return;
    saveLessons(getLessons().filter((item) => item.id !== id));
    const quizzesNow = getQuizzes().filter((quiz) => quiz.lessonId !== id);
    // Preserve the one-quiz-per-lesson invariant when a lesson is removed.
    saveQuizzes(quizzesNow);
    setRefresh((value) => value + 1);
  }
  function removeQuiz(quiz) {
    if (!window.confirm(`Delete the quiz for ${quiz.title}?`)) return;
    saveQuizzes(getQuizzes().filter((item) => item.id !== quiz.id));
    setRefresh((value) => value + 1);
  }
  function updateQuestion(index, patch) { setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)); }

  return <section className="admin-page admin-learning-manager">
    <div className="admin-page-title"><div><span className="admin-eyebrow">CONTENT MANAGEMENT</span><h2>{isQuiz ? "Lesson quizzes" : "Free learning lessons"}</h2><p>{isQuiz ? "Create one quiz for each lesson and set its instructions and time limit." : "Organize lesson content by learning track."}</p></div><span className="admin-content-count">{isQuiz ? currentQuizzes.length : currentLessons.length} {isQuiz ? "quizzes" : "lessons"}</span></div>
    <div className="admin-learning-grid">
      <form className="admin-editor-panel" onSubmit={isQuiz ? saveQuiz : saveLesson}>
        <div className="admin-editor-heading"><span>{isQuiz ? <ClipboardCheck size={19}/> : <BookOpen size={19}/>}</span><div><h3>{editingId ? "Edit" : "Create"} {isQuiz ? "lesson quiz" : "lesson"}</h3><p>{isQuiz ? "Each lesson can have one quiz." : "Add a lesson to the free learning catalog."}</p></div></div>
        {!isQuiz && <label>Learning track<select value={trackId} onChange={(event) => setTrackId(event.target.value)} required><option value="">Select a track</option>{(Array.isArray(tracks) ? tracks : initialTracks).map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select></label>}
        {isQuiz && <label>Lesson<select value={lessonId} onChange={(event) => setLessonId(event.target.value)} required><option value="">Select a lesson</option>{safeLessons.map((lesson) => { const taken = quizzes.some((quiz) => quiz.lessonId === lesson.id && quiz.id !== editingId); return <option key={lesson.id} value={lesson.id} disabled={taken}>{lesson.title}{taken ? " — quiz already exists" : ""}</option>; })}</select></label>}
        <label>{isQuiz ? "Quiz title" : "Lesson title"}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={isQuiz ? "e.g. HTML fundamentals quiz" : "e.g. Introduction to HTML"} required/></label>
        {isQuiz ? <>
          <label>Instructions<textarea rows="3" value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Put each instruction on its own line"/></label>
          <label>Time limit (minutes)<input type="number" min="1" max="180" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)}/></label>
          <div className="admin-question-list">{questions.map((item, index) => <fieldset className="admin-question-editor" key={item.id}><legend>Question {index + 1}</legend><button type="button" className="admin-icon-button" aria-label={`Remove question ${index + 1}`} onClick={() => setQuestions((items) => items.filter((_, itemIndex) => itemIndex !== index))} disabled={questions.length === 1}><Trash2 size={15}/></button><label>Question<textarea rows="2" value={item.question} onChange={(event) => updateQuestion(index, { question: event.target.value })}/></label>{item.options.map((option, optionIndex) => <label key={optionIndex}>Answer {String.fromCharCode(65 + optionIndex)}<input value={option} onChange={(event) => updateQuestion(index, { options: item.options.map((value, valueIndex) => valueIndex === optionIndex ? event.target.value : value) })}/></label>)}<label>Correct answer<select value={item.correctAnswer} onChange={(event) => updateQuestion(index, { correctAnswer: Number(event.target.value) })}>{item.options.map((option, optionIndex) => <option key={optionIndex} value={optionIndex}>{String.fromCharCode(65 + optionIndex)}</option>)}</select></label><label>Explanation (optional)<textarea rows="2" value={item.explanation} onChange={(event) => updateQuestion(index, { explanation: event.target.value })}/></label></fieldset>)}<button type="button" className="admin-secondary" onClick={() => setQuestions((items) => [...items, blankQuestion()])}><Plus size={16}/> Add question</button></div>
        </> : <><label>Short description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will students learn?"/></label><label>Lesson content<textarea rows="8" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write lesson content. Use blank lines between paragraphs."/></label></>}
        <label className="admin-publish-toggle"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)}/> Publish {isQuiz ? "quiz" : "lesson"}</label>
        {message && <p className="admin-form-message" role="alert">{message}</p>}
        <div className="admin-editor-actions"><button type="submit" className="admin-primary"><Save size={16}/> Save {isQuiz ? "quiz" : "lesson"}</button>{editingId && <button type="button" className="admin-secondary" onClick={resetForm}>Cancel</button>}</div>
      </form>
      <div className="admin-record-panel"><div className="admin-record-top"><h3>{isQuiz ? "Existing quizzes" : "Lessons"}</h3><input aria-label="Search records" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..."/></div>
        {(isQuiz ? currentQuizzes : currentLessons).map((item) => { const lesson = isQuiz ? safeLessons.find((entry) => entry.id === item.lessonId) : null; return <article className="admin-learning-record" key={item.id}><div><strong>{item.title}</strong><span>{isQuiz ? lesson?.title || item.lessonId : titleCase(item.trackId || "Unassigned")}</span><span className={`admin-record-status ${item.published ? "published" : "draft"}`}>{item.published ? "Published" : "Draft"}</span></div><div className="admin-record-actions"><button type="button" onClick={() => isQuiz ? editQuiz(item) : editLesson(item)}>Edit</button><button type="button" className="danger" onClick={() => isQuiz ? removeQuiz(item) : removeLesson(item.id)}>Delete</button></div></article>; })}
        {(isQuiz ? currentQuizzes : currentLessons).length === 0 && <div className="admin-empty">No matching {isQuiz ? "quizzes" : "lessons"} yet.</div>}
      </div>
    </div>
  </section>;
}
