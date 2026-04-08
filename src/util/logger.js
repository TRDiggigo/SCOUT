// Tiny structured logger. Plain JSON to stderr — no third-party dependency.
const LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50 };

function envLevel() {
  const raw = (process.env.SCOUT_LOG_LEVEL || "info").toLowerCase();
  return LEVELS[raw] ?? LEVELS.info;
}

function emit(level, msg, fields) {
  if (LEVELS[level] < envLevel()) return;
  const record = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(fields ?? {})
  };
  process.stderr.write(JSON.stringify(record) + "\n");
}

export const logger = {
  trace: (msg, fields) => emit("trace", msg, fields),
  debug: (msg, fields) => emit("debug", msg, fields),
  info: (msg, fields) => emit("info", msg, fields),
  warn: (msg, fields) => emit("warn", msg, fields),
  error: (msg, fields) => emit("error", msg, fields),
  child(bindings) {
    return {
      trace: (msg, f) => emit("trace", msg, { ...bindings, ...f }),
      debug: (msg, f) => emit("debug", msg, { ...bindings, ...f }),
      info: (msg, f) => emit("info", msg, { ...bindings, ...f }),
      warn: (msg, f) => emit("warn", msg, { ...bindings, ...f }),
      error: (msg, f) => emit("error", msg, { ...bindings, ...f })
    };
  }
};
