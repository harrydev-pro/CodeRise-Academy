// Curriculum entries are either plain text or { title, items }.
export function curriculumTitles(program) {
  return (Array.isArray(program?.curriculum) ? program.curriculum : [])
    .map((entry) => (typeof entry === "string" ? entry : entry?.title))
    .filter(Boolean);
}

export function listOf(value) {
  return (Array.isArray(value) ? value : []).map((entry) => (typeof entry === "string" ? { title: entry } : entry)).filter((entry) => entry?.title);
}
