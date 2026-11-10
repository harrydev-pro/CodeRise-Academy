import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import ProgramIcon from "../../components/common/ProgramIcon";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatCurrency } from "../../utils/formatCurrency";
import { getProgramPrice } from "../../utils/programPrice";

export default function AdminPrograms() {
  const { data: programs, loading, error, reload } = useApiResource("/admin/programs?includeArchived=true", "programs");
  return (
    <section className="admin-page">
      <PageHeader eyebrow="CATALOG" title="Programs" description="Training programs, prices, and what students see on the Programs page."
        actions={<Link to="/admin/programs/new" className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New program</Link>} />
      {loading ? <Loader label="Loading programs…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
        <ul className="ui-list">
          {programs.map((program) => (
            <li className="ui-list-item" key={program.id}>
              <span className="student-track-icon"><ProgramIcon program={program} size={22} /></span>
              <div className="min-w-0">
                <h3><Link to={`/admin/programs/${program.id}`}>{program.title}</Link></h3>
                <p>{formatCurrency(getProgramPrice(program))} · {program.duration || "Duration not set"} · {program.applicationCount} applications</p>
              </div>
              <div className="ui-actions">
                {program.archived ? <span className="ui-pill">Archived</span> : program.published ? <span className="ui-pill green">Published</span> : <span className="ui-pill amber">Draft</span>}
                <Link to={`/admin/programs/${program.id}`} className="btn btn-outline btn-sm">Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
