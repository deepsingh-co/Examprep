import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

export default upload;