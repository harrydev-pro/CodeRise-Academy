import { useState } from "react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, Pagination, SelectField, TableWrap } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { queryString } from "../../services/api/api";

const TYPES = ["", "program", "track", "level", "topic", "note", "quiz", "question", "project", "submission", "video_course", "video_lesson", "enrollment", "application", "user"];

export default function AdminActivity() {
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApiResource(`/admin/activity${queryString({ entityType, page })}`, null, null);
  return (
    <section className="admin-page">
      <PageHeader eyebrow="ACCOUNTABILITY" title="Activity log" description="Every change made by administrators." />
      <div className="ui-toolbar">
        <SelectField label="Area" value={entityType} onChange={(value) => { setEntityType(value); setPage(1); }} options={TYPES.map((value) => ({ value, label: value ? value.replace("_", " ") : "Everything" }))} />
      </div>
      {loading ? <Loader label="Loading activity…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
        <>
          <TableWrap>
            <table className="ui-table">
              <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {data.activity.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString("en-NG")}</td>
                    <td>{entry.actor?.name || "—"}</td>
                    <td>{entry.action.replace(".", " · ").replace("_", " ")}</td>
                    <td>{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </section>
  );
}
