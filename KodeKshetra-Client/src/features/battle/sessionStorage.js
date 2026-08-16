/**
 * @file sessionStorage.js
 * @description Typed helpers for reading and writing battle-related data in
 *   sessionStorage. Using centralised SESSION_KEYS avoids key-string typos
 *   and makes it trivial to rename keys in one place.
 *
 * Key layout
 * ----------
 * battleData                  – Serialized battle payload (question, IDs, timing)
 * roomId                      – Active battle room identifier
 * serverTimeOffsetMs          – Difference between server clock and client clock (ms)
 * matchmakingQueuedServerNow  – Server timestamp captured when user entered the queue
 * isWaiting                   – "true" while the battle result is being computed server-side
 * battleResultNote            – Outcome string: "won" | "loss" | "draw"
 * battleResultDetails         – Richer resolution payload (player stats, XP, etc.)
 * battleCode:<problemId>:<lang> – Draft code, one entry per problem/language pair
 */

const SESSION_KEYS = {
  battleData: "battleData",
  roomId: "roomId",
  serverTimeOffsetMs: "serverTimeOffsetMs",
  matchmakingQueuedServerNow: "matchmakingQueuedServerNow",
  isWaiting: "isWaiting",
  battleResultNote: "battleResultNote",
  battleResultDetails: "battleResultDetails",
};

// Draft code is stored under one key per problem/language pair, so the keys
// cannot live in SESSION_KEYS. The shared prefix is what makes them findable
// again in clearBattleSession().
const BATTLE_CODE_KEY_PREFIX = "battleCode:";

/**
 * Builds the sessionStorage key holding a player's draft code.
 * Scoped per problem so switching battles never resurrects code from a
 * previous problem, and per language so each editor tab keeps its own draft.
 * @param {string|null|undefined} problemId
 * @param {string} language
 * @returns {string}
 */
function getBattleCodeKey(problemId, language) {
  return `${BATTLE_CODE_KEY_PREFIX}${problemId || "default"}:${language}`;
}

/**
 * Safely parses a JSON string.  Returns `fallback` on any failure.
 * @template T
 * @param {string|null} value - Raw sessionStorage string.
 * @param {T} fallback - Value returned when parsing fails.
 * @returns {T}
 */
function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Readers
// ---------------------------------------------------------------------------

/**
 * Returns the current battle object.
 * Prefers the value passed via `navigate` state over the persisted copy so
 * that a fresh navigation always wins.
 * @param {object|null} navigationBattle - Battle from React Router location.state.
 * @returns {object}
 */
export function getStoredBattle(navigationBattle) {
  return navigationBattle || parseJson(sessionStorage.getItem(SESSION_KEYS.battleData), {});
}

/**
 * Returns the active room ID.
 * Prefers the navigation value; falls back to the persisted one.
 * @param {string|null} navigationRoomId
 * @returns {string|null}
 */
export function getStoredRoomId(navigationRoomId) {
  if (navigationRoomId !== undefined && navigationRoomId !== null) {
    return navigationRoomId;
  }
  return parseJson(sessionStorage.getItem(SESSION_KEYS.roomId), null);
}

/**
 * Returns the stored server-to-client clock offset in milliseconds.
 * Used to derive synced time remaining without relying on the local clock alone.
 * @returns {number}
 */
export function getStoredServerTimeOffset() {
  const rawValue = sessionStorage.getItem(SESSION_KEYS.serverTimeOffsetMs);
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * Returns the server timestamp recorded when the user first entered the matchmaking queue.
 * Used by `resumeBattleState` to locate battles that started after queuing.
 * @returns {number} Unix timestamp in ms, or 0 if not stored.
 */
export function getStoredMatchmakingQueuedServerNow() {
  const rawValue = sessionStorage.getItem(SESSION_KEYS.matchmakingQueuedServerNow);
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * Returns whether the client is currently waiting for the battle result from the server.
 * @returns {boolean}
 */
export function getStoredWaitingState() {
  return sessionStorage.getItem(SESSION_KEYS.isWaiting) === "true";
}

/**
 * Returns the battle outcome note ("won", "loss", "draw", or empty string).
 * @returns {string}
 */
export function getStoredBattleNote() {
  return sessionStorage.getItem(SESSION_KEYS.battleResultNote) || "";
}

/**
 * Returns the detailed battle resolution payload, or null if not stored.
 * @returns {object|null}
 */
export function getStoredBattleResultDetails() {
  return parseJson(sessionStorage.getItem(SESSION_KEYS.battleResultDetails), null);
}

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

/**
 * Persists the battle context and room ID so they survive page refreshes.
 * Also extracts `serverTimeOffsetMs` from the battle object when present.
 * @param {object|null} battle
 * @param {string|null} roomId
 */
export function persistBattleContext(battle, roomId) {
  if (battle) {
    sessionStorage.setItem(SESSION_KEYS.battleData, JSON.stringify(battle));

    if (typeof battle.serverTimeOffsetMs === "number" && Number.isFinite(battle.serverTimeOffsetMs)) {
      sessionStorage.setItem(SESSION_KEYS.serverTimeOffsetMs, JSON.stringify(battle.serverTimeOffsetMs));
    } else {
      sessionStorage.removeItem(SESSION_KEYS.serverTimeOffsetMs);
    }
  }

  if (roomId !== undefined && roomId !== null) {
    sessionStorage.setItem(SESSION_KEYS.roomId, JSON.stringify(roomId));
  }
}

/**
 * Stores or clears the server timestamp used to resume matchmaking state.
 * Pass `null` to clear (e.g. when the battle has started).
 * @param {number|null} serverNow
 */
export function persistMatchmakingQueuedServerNow(serverNow) {
  if (Number.isFinite(Number(serverNow))) {
    sessionStorage.setItem(SESSION_KEYS.matchmakingQueuedServerNow, JSON.stringify(Number(serverNow)));
    return;
  }
  sessionStorage.removeItem(SESSION_KEYS.matchmakingQueuedServerNow);
}

/**
 * Marks the client as waiting (or no longer waiting) for the battle result.
 * @param {boolean} isWaiting
 */
export function persistWaitingState(isWaiting) {
  if (isWaiting) {
    sessionStorage.setItem(SESSION_KEYS.isWaiting, "true");
    return;
  }
  sessionStorage.removeItem(SESSION_KEYS.isWaiting);
}

/**
 * Stores the battle outcome and optional detailed resolution payload.
 * @param {string} note - Outcome string ("won", "loss", or "draw").
 * @param {object|null} [details] - Full resolution payload from the server.
 */
export function persistBattleResult(note, details = null) {
  sessionStorage.setItem(SESSION_KEYS.battleResultNote, note || "");

  if (details) {
    sessionStorage.setItem(SESSION_KEYS.battleResultDetails, JSON.stringify(details));
    return;
  }
  sessionStorage.removeItem(SESSION_KEYS.battleResultDetails);
}

/**
 * Reads the draft code saved for a problem/language pair.
 * @param {string|null|undefined} problemId
 * @param {string} language
 * @returns {string|null} Saved code, or null when nothing is stored.
 */
export function getStoredBattleCode(problemId, language) {
  return sessionStorage.getItem(getBattleCodeKey(problemId, language));
}

/**
 * Saves the draft code for a problem/language pair so it survives refreshes
 * and language switches within the same battle.
 * @param {string|null|undefined} problemId
 * @param {string} language
 * @param {string} code
 */
export function persistBattleCode(problemId, language, code) {
  sessionStorage.setItem(getBattleCodeKey(problemId, language), code);
}

/**
 * Clears all battle-related keys from sessionStorage, including every
 * per-problem draft-code entry.
 * Should be called when the user returns to the dashboard.
 */
export function clearBattleSession() {
  Object.values(SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));

  const codeKeys = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(BATTLE_CODE_KEY_PREFIX)) {
      codeKeys.push(key);
    }
  }
  // Collected first: removing while iterating would shift the remaining indices.
  codeKeys.forEach((key) => sessionStorage.removeItem(key));
}
