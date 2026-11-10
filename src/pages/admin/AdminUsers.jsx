import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, Pagination, SelectField, StatusBadge, TableWrap, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { queryString } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const filters = {
    q: params.get("q") || "", role: params.get("role") || "", status: params.get("status") || "",
    sort: params.get("sort") || "-registeredAt", page: params.get("page") || "1", pageSize: "20",
  };
  const { data, loading, error, reload } = useApiResource(`/admin/users${queryString(filters)}`, null, null);
  const update = (changes) => setParams(Object.fromEntries(Object.entries({ ...filters, page: "1", ...changes }).filter(([, value]) => value)), { replace: true });

  return (
    <section className="admin-page">
      <PageHeader eyebrow="PEOPLE" title="Users" description="Every registered account, with learning activity at a glance." />
      <form className="ui-toolbar" onSubmit={(event) => { event.preventDefault(); update({ q: search.trim() }); }}>
        <TextField label="Search" type="search" value={search} onChange={setSearch} placeholder="Name, email, or phone" />
        <SelectField label="Role" value={filters.role} onChange={(role) => update({ role })} options={[{ value: "", label: "All roles" }, { value: "student", label: "Students" }, { value: "admin", label: "Admins" }]} />
        <SelectField label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "suspended", label: "Deactivated" }]} />
        <SelectField label="Sort by" value={filters.sort} onChange={(sort) => update({ sort })} options={[
          { value: "-registeredAt", label: "Newest first" }, { value: "registeredAt", label: "Oldest first" },
          { value: "name", label: "Name A–Z" }, { value: "-lastActiveAt", label: "Recently active" },
        ]} />
        <button type="submit" className="btn btn-primary ui-toolbar-fixed">Search</button>
      </form>

      {loading ? <Loader label="Loading users…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : data.users.length === 0 ? (
        <p className="muted-text">No users match these filters.</p>
      ) : (
        <>
          <TableWrap>
            <table className="ui-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Status</th><th>Active tracks</th><th>Quiz attempts</th><th>Projects</th><th>Applications</th></tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td><Link to={`/admin/users/${user.id}`}>{user.name}</Link>{user.role !== "student" && <div><span className="ui-pill blue">Admin</span></div>}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{formatDate(user.registeredAt)}</td>
                    <td><StatusBadge status={user.status === "active" ? "Active" : "Deactivated"} /></td>
                    <td>{user.activeTracks}</td>
                    <td>{user.quizAttempts}</td>
                    <td>{user.projectSubmissions}</td>
                    <td>{user.applications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <Pagination pagination={data.pagination} onPage={(page) => update({ page: String(page) })} />
        </>
      )}
    </section>
  );
}
