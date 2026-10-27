import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { readStore, writeStore } from "../../services/storage/storageAdapter";

const starterProjects = [
  { id: "frontend-project-1", trackId: "track-frontend", title: "Personal Portfolio", level: "Beginner", estimatedTime: "3 hours", maxScore: 100, description: "Build a responsive portfolio page using semantic HTML, CSS, and JavaScript." },
  { id: "design-project-1", trackId: "track-product-design", title: "Mobile App Concept", level: "Beginner", estimatedTime: "4 hours", maxScore: 100, description: "Design a clear mobile experience for a real user need, from wireframe to clickable prototype." },
  { id: "backend-project-1", trackId: "track-backend", title: "Task API", level: "Beginner", estimatedTime: "4 hours", maxScore: 100, description: "Plan and build a small REST API for creating and managing tasks." },
];

export function getProjects() {
  const projects = readStore(STORAGE_KEYS.projects, starterProjects);
  return Array.isArray(projects) ? projects : starterProjects;
}

export function getProjectsByTrack(trackId) {
  return getProjects().filter((project) => project.trackId === trackId);
}

export function submitProject(submission) {
  const submissions = readStore(STORAGE_KEYS.submissions, []);
  const record = { ...submission, id: `submission-${Date.now()}`, createdAt: new Date().toISOString() };
  if (!writeStore(STORAGE_KEYS.submissions, [record, ...submissions])) {
    throw new Error("Unable to save your project submission.");
  }
  return record;
}
