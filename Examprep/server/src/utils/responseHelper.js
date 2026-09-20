export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message = "Server Error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
