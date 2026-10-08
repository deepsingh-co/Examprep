const isPlainObject = (value) => {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const attachIds = (node) => {
  if (Array.isArray(node)) {
    for (const item of node) attachIds(item);
    return node;
  }
  if (!isPlainObject(node)) return node;

  if (node._id !== undefined && node.id === undefined) {
    node.id = String(node._id);
  }

  for (const key of Object.keys(node)) {
    if (key === "id") continue;
    attachIds(node[key]);
  }
  return node;
};

// Mongoose `.lean()` results and `toJSON()` output only expose `_id`.
// The frontend consistently reads `.id`, so mirror `_id` onto `id` for every
// JSON response (recursively, including nested arrays like questions/options).
const serializeIds = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body === null || typeof body !== "object") {
      return originalJson(body);
    }
    try {
      const clone = JSON.parse(JSON.stringify(body));
      attachIds(clone);
      return originalJson(clone);
    } catch {
      return originalJson(body);
    }
  };

  next();
};

export default serializeIds;
