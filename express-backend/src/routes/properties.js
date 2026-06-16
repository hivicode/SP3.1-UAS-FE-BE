const express = require("express");
const multer = require("multer");
const {
  listProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertiesController");
const { authRequired } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/", listProperties);
router.get("/:kode", getProperty);
router.post("/", authRequired, upload.array("gambar"), createProperty);
router.put("/:kode", authRequired, upload.array("gambar"), updateProperty);
router.delete("/:kode", authRequired, deleteProperty);

module.exports = router;
