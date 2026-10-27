import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { readStore, writeStore } from "../../services/storage/storageAdapter";
import { initialVideoCourses } from "../../data/initialVideoCourses";

function ensureCourses() {
  const stored = readStore(STORAGE_KEYS.videoCourses, null);

  if (Array.isArray(stored)) {
    return stored;
  }

  writeStore(STORAGE_KEYS.videoCourses, initialVideoCourses);

  return initialVideoCourses;
}

export function getVideoCourses() {
  return ensureCourses();
}

export function getVideoCourseById(courseId) {
  return getVideoCourses().find(
    (course) => course.id === courseId
  ) || null;
}

export function addVideoCourse(course) {
  const courses = getVideoCourses();

  const newCourse = {
    ...course,
    id: course.id || `video-course-${Date.now()}`,
    lessons: Array.isArray(course.lessons) ? course.lessons : [],
    published: course.published ?? false,
    createdAt: new Date().toISOString(),
  };

  writeStore(STORAGE_KEYS.videoCourses, [...courses, newCourse]);

  return newCourse;
}

export function updateVideoCourse(courseId, updates) {
  const courses = getVideoCourses();

  let updatedCourse = null;

  const updatedCourses = courses.map((course) => {
    if (course.id !== courseId) return course;

    updatedCourse = {
      ...course,
      ...updates,
      id: course.id,
      updatedAt: new Date().toISOString(),
    };

    return updatedCourse;
  });

  if (updatedCourse) {
    writeStore(STORAGE_KEYS.videoCourses, updatedCourses);
  }

  return updatedCourse;
}

export function deleteVideoCourse(courseId) {
  const updatedCourses = getVideoCourses().filter(
    (course) => course.id !== courseId
  );

  writeStore(STORAGE_KEYS.videoCourses, updatedCourses);

  return true;
}