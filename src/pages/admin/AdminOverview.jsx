import { Activity, BookOpen, FileCheck2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function AdminOverview() {
  const applications = useApiResource("/applications", "applications");
  const submissions = useApiResource("/learning/instructor/submissions", "submissions");
  const resources = [applications, submissions];
  if (resources.some((resource) => resource.loading)) return <section className="admin-page"><Loader label="Loading instructor dashboard…" /></section>;
  const error = resources.find((resource) => resource.error);
  if (error) return <section className="admin-page"><ErrorMessage message={error.error} onRetry={() => resources.forEach((resource) => resource.reload())} /></section>;
  const stats = [
    { title: "Applications", value: applications.data.length, Icon: FileText, to: "/admin/applications" },
    { title: "Project submissions", value: submissions.data.length, Icon: FileCheck2, to: "/admin/submissions" },
  ];
  return <section className="admin-page">
    <div className="admin-page-title"><div><span className="admin-eyebrow">INSTRUCTOR WORKSPACE</span><h2>Academy Dashboard</h2><p>Review student applications and project work.</p></div></div>
    <div className="admin-stats">{stats.map(({ title, value, Icon, to }) => <Link className="admin-stat" to={to} key={title}><span><Icon size={20} /></span><div><p>{title}</p><strong>{value}</strong></div></Link>)}</div>
    <div className="admin-panels"><section className="admin-panel"><h3>Teaching tools</h3><div className="admin-links"><Link to="/admin/applications">Review program applications <span>→</span></Link><Link to="/admin/submissions">Review project submissions <span>→</span></Link><Link to="/free-learning">Preview published learning content <BookOpen size={17} /></Link></div></section><section className="admin-panel"><h3>Updates</h3><div className="admin-status"><Activity size={20} /><div><strong>Student updates are connected</strong><p>Application decisions and project feedback create in-app notifications.</p></div></div></section></div>
  </section>;
}
