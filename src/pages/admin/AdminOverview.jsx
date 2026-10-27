import { Activity, BookOpen, CircleDollarSign, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { readStore } from "../../services/storage/storageAdapter";
import { initialPrograms } from "../../data/initialPrograms";
import { initialVideoCourses } from "../../data/initialVideoCourses";

const records = (key, fallback = []) => {
  const value = readStore(key, fallback);
  return Array.isArray(value) ? value : fallback;
};

export default function AdminOverview() {
  const users = records(STORAGE_KEYS.users);
  const programs = records(STORAGE_KEYS.programs, initialPrograms);
  const applications = records(STORAGE_KEYS.applications);
  const courses = records(STORAGE_KEYS.videoCourses, initialVideoCourses);
  const stats = [
    { title: "Total Students", value: users.filter((user) => user?.role !== "admin").length, Icon: Users },
    { title: "Programs", value: programs.length, Icon: BookOpen },
    { title: "Applications", value: applications.length, Icon: FileText },
    { title: "Video Courses", value: courses.length, Icon: CircleDollarSign },
  ];

  return <section className="admin-page">
    <div className="admin-page-title"><div><span className="admin-eyebrow">OVERVIEW</span><h2>Admin Dashboard</h2><p>Manage your academy and track activity across the platform.</p></div><Link className="admin-primary" to="/admin/applications">Review applications</Link></div>
    <div className="admin-stats">{stats.map(({ title, value, Icon }) => <article className="admin-stat" key={title}><span><Icon size={20}/></span><div><p>{title}</p><strong>{value}</strong></div></article>)}</div>
    <div className="admin-panels"><section className="admin-panel"><h3>Quick actions</h3><div className="admin-links"><Link to="/admin/programs">Manage programs <span>→</span></Link><Link to="/admin/video-management">Manage video courses <span>→</span></Link><Link to="/admin/users">View learners <span>→</span></Link><Link to="/admin/applications">Review applications <span>→</span></Link></div></section><section className="admin-panel"><h3>Platform status</h3><div className="admin-status"><Activity size={20}/><div><strong>Academy is ready</strong><p>Your content and learner records are stored in this browser.</p></div></div></section></div>
  </section>;
}
