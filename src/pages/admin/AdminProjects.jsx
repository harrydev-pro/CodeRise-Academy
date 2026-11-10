import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, SelectField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { queryString } from "../../services/api/api";

export default function AdminProjects() {
  const [params, setParams] = useSearchParams();
  const trackId = params.get("trackId") || "";
  const tracks = useApiResource("/admin/tracks", "tracks");
  const projects = useApiResource(`/admin/projects${queryString({ trackId, includeArchived: "true" })}`, "projects");
  return (
    <section className="admin-page">
      <PageHeader eyebrow="FREE LEARNING" title="Practical projects" description="Project briefs students build and submit for review."
        actions={trackId && <Link to={`/admin/projects/new?trackId=${trackId}`} className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New project</Link>} />
      <div className="ui-toolbar">
        <SelectField label="Track" value={trackId} onChange={(value) => setParams(value ? { trackId: value } : {}, { replace: true })}
          options={[{ value: "", label: "All tracks" }, ...tracks.data.map((track) => ({ value: track.id, label: track.title }))]} />
      </div>
      {!trackId && <p className="ui-hint">Choose a track to add a new project to it.</p>}
      {projects.loading ? <Loader label="Loading projects…" /> : projects.error ? <ErrorMessage message={projects.error} onRetry={projects.reload} /> : (
        <ul className="ui-list">
          {projects.data.map((project) => (
            <li className="ui-list-item" key={project.id}>
              <div className="min-w-0">
                <h3><Link to={`/admin/projects/${project.id}`}>{project.title}</Link></h3>
                <p>{project.track?.title} · {project.level || "No level"} · {project.submissionCount} submissions</p>
              </div>
              <div className="ui-actions">
                {project.archived ? <span className="ui-pill">Archived</span> : project.published ? <span className="ui-pill green">Published</span> : <span className="ui-pill amber">Draft</span>}
                <Link to={`/admin/submissions?projectId=${project.id}`} className="btn btn-ghost btn-sm">Submissions</Link>
                <Link to={`/admin/projects/${project.id}`} className="btn btn-outline btn-sm">Edit</Link>
              </div>
            </li>
          ))}
          {projects.data.length === 0 && <p className="muted-text">No projects yet.</p>}
        </ul>
      )}
    </section>
  );
}
