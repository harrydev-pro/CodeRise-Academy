import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { readStore, writeStore } from "../../services/storage/storageAdapter";
import { initialPrograms } from "../../data/initialPrograms";
import { initialVideoCourses } from "../../data/initialVideoCourses";
import { initialTracks } from "../../data/initialTracks";
import { initialLessons } from "../../data/initialLessons";
import { initialQuizzes } from "../../data/initialQuizzes";
import { formatCurrency } from "../../utils/formatCurrency";

const config = {
  users: { title: "Manage Users", key: STORAGE_KEYS.users, columns: ["fullName", "email", "role", "status"], label: "Users" },
  activity: { title: "Recent Activity", key: STORAGE_KEYS.activityLogs, columns: ["description", "userName", "createdAt"], label: "Activity" },
  courses: { title: "Manage Courses", key: STORAGE_KEYS.tracks, columns: ["title", "category", "level", "published"], label: "Courses" },
  lessons: { title: "Manage Lessons", key: STORAGE_KEYS.lessons, columns: ["title", "trackId", "order"], label: "Lessons" },
  "video-management": { title: "Video Courses", key: STORAGE_KEYS.videoCourses, columns: ["title", "category", "price", "published"], label: "Video Course" },
  programs: { title: "Manage Programs", key: STORAGE_KEYS.programs, columns: ["title", "category", "duration", "promotionalPrice", "published"], label: "Program" },
  pricing: { title: "Program Pricing", key: STORAGE_KEYS.programs, columns: ["title", "originalPrice", "promotionalPrice", "published"], label: "Pricing" },
  quizzes: { title: "Manage Quizzes", key: STORAGE_KEYS.quizzes, columns: ["title", "trackId", "questionCount"], label: "Quiz" },
  submissions: { title: "Project Submissions", key: STORAGE_KEYS.submissions, columns: ["projectTitle", "studentName", "status", "submittedAt"], label: "Submission" },
  applications: { title: "Program Applications", key: STORAGE_KEYS.applications, columns: ["fullName", "programTitle", "submittedAt", "status"], label: "Application" },
  settings: { title: "Settings", key: STORAGE_KEYS.settings, columns: [], label: "Setting" },
};

const read = (key, fallback = []) => {
  const value = readStore(key, fallback);
  return Array.isArray(value) ? value : fallback;
};
const pretty = (value, column) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Published" : "Draft";
  if (typeof value === "number" && /price/i.test(column)) return formatCurrency(value);
  if (typeof value === "string" && value.length > 30) return `${value.slice(0, 30)}…`;
  return String(value);
};

export default function AdminPage() {
  const { pathname } = useLocation();
  const section = pathname.split("/")[2] || "overview";
  const current = config[section];
  const [, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const rows = (() => {
    if (section === "overview" || !current) return [];
    const defaults = section === "programs" || section === "pricing" ? initialPrograms
      : section === "video-management" ? initialVideoCourses
        : section === "courses" ? initialTracks
          : section === "lessons" ? initialLessons
            : section === "quizzes" ? initialQuizzes : [];
    let values = read(current.key, defaults);
    if (section === "settings") return Object.entries(readStore(STORAGE_KEYS.settings, {})).map(([key, value]) => ({ key, value }));
    if ((section === "users") && values.length === 0) values = [];
    return values.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  })();

  function addRecord() {
    const name = window.prompt(`Enter ${current.label} name`);
    if (!name?.trim()) return;
    const now = new Date().toISOString();
    const record = section === "programs" || section === "pricing"
      ? { id: `program-${Date.now()}`, title: name.trim(), category: "Development", description: "New program", duration: "3 months", originalPrice: 0, promotionalPrice: 0, features: [], published: false }
      : section === "video-management"
        ? { id: `course-${Date.now()}`, title: name.trim(), category: "Development", description: "New video course", price: 0, lessons: [], published: false, createdAt: now }
        : { id: `record-${Date.now()}`, title: name.trim(), createdAt: now, published: false };
    writeStore(current.key, [...read(current.key), record]);
    setRefresh((value) => value + 1);
  }

  function removeRecord(id) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    writeStore(current.key, read(current.key).filter((row) => row.id !== id));
    setRefresh((value) => value + 1);
  }

  if (!current) {
    return <section className="admin-page"><div className="admin-empty">This admin section could not be found.</div></section>;
  }

  const columns = section === "settings" ? ["key", "value"] : current.columns;
  return <section className="admin-page"><div className="admin-page-title"><div><span className="admin-eyebrow">ADMINISTRATION</span><h2>{current.title}</h2><p>Review and update your academy records.</p></div>{["programs", "pricing", "video-management"].includes(section) && <button className="admin-primary" onClick={addRecord}><Plus size={17}/> Add {current.label}</button>}</div><div className="admin-table-panel"><label className="admin-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${current.label.toLowerCase()}…`}/></label><div className="admin-table-scroll"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replace(/([A-Z])/g, " $1")}</th>)}{["programs", "pricing", "video-management"].includes(section) && <th>Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.key || index}>{columns.map((column) => <td key={column}>{pretty(row[column] ?? row.name, column)}</td>)}{["programs", "pricing", "video-management"].includes(section) && <td><button className="admin-delete" onClick={() => removeRecord(row.id)}>Delete</button></td>}</tr>)}</tbody></table>{rows.length === 0 && <div className="admin-empty">No records found yet.</div>}</div><p className="admin-table-count">{rows.length} {current.label.toLowerCase()}</p></div></section>;
}
