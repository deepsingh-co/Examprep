const parseOrigins = (raw) =>
  (raw || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const getAllowedOrigins = () => {
  const configured = parseOrigins(process.env.CLIENT_URL);
  return [
    ...configured,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
};

export const corsOrigin = (origin, callback) => {
  // No Origin header (server-to-server, curl, same-origin) -> allow.
  if (!origin) return callback(null, true);

  const allowed = getAllowedOrigins();
  const isAllowed =
    allowed.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);

  callback(null, isAllowed);
};
