import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { initialPrograms } from "../../data/initialPrograms";
import { generateId } from "../../utils/generateId";

function ensurePrograms() {
  const stored = readStore(STORAGE_KEYS.programs, null);

  if (Array.isArray(stored)) {
    return stored;
  }

  writeStore(STORAGE_KEYS.programs, initialPrograms);

  return initialPrograms;
}

export function getPrograms() {
  return ensurePrograms();
}

export function getPublishedPrograms() {
  return getPrograms().filter(
    (program) => program.published !== false
  );
}

export function getProgramById(programId) {
  return getPrograms().find(
    (program) => program.id === programId
  ) || null;
}

export function addProgram(programData) {
  const programs = getPrograms();

  const program = {
    ...programData,
    id: programData.id || generateId(),
    published: programData.published ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore(STORAGE_KEYS.programs, [...programs, program]);

  return program;
}

export function updateProgram(programId, updates) {
  const programs = getPrograms();

  let updatedProgram = null;

  const updatedPrograms = programs.map((program) => {
    if (program.id !== programId) {
      return program;
    }

    updatedProgram = {
      ...program,
      ...updates,
      id: program.id,
      updatedAt: new Date().toISOString(),
    };

    return updatedProgram;
  });

  if (updatedProgram) {
    writeStore(STORAGE_KEYS.programs, updatedPrograms);
  }

  return updatedProgram;
}

export function deleteProgram(programId) {
  const programs = getPrograms();

  const updatedPrograms = programs.filter(
    (program) => program.id !== programId
  );

  if (updatedPrograms.length === programs.length) {
    return false;
  }

  writeStore(STORAGE_KEYS.programs, updatedPrograms);

  return true;
}
 