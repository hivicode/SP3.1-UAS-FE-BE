const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { uploadDir } = require("../config");
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadFilename,
} = require("../controllers/propertiesController");
const { authRequired } = require("../middleware/auth");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: uploadFilename,
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", listProperties);
router.get("/:kode", getProperty);
router.post("/", authRequired, upload.array("gambar"), createProperty);
router.put("/:kode", authRequired, upload.array("gambar"), updateProperty);
router.delete("/:kode", authRequired, deleteProperty);

module.exports = router;
