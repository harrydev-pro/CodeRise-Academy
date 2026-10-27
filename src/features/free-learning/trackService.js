import { STORAGE_KEYS } from "../../services/storage/storageKeys";

import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { initialTracks } from "../../data/initialTracks";

export function getTracks() {
  return readStore(
    STORAGE_KEYS.tracks,
    initialTracks
  );
}

export function getPublishedTracks() {
  return getTracks().filter(
    (track) => track.published
  );
}

export function getTrackById(id) {
  return getTracks().find(
    (track) => track.id === id
  );
}

export function saveTracks(tracks) {
  return writeStore(
    STORAGE_KEYS.tracks,
    tracks
  );
}

export function updateTrack(id, updates) {
  const tracks = getTracks();

  const updatedTracks = tracks.map((track) =>
    track.id === id
      ? { ...track, ...updates }
      : track
  );

  saveTracks(updatedTracks);

  return updatedTracks;
}