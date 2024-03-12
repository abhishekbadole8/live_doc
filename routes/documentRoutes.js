const express = require("express");
const router = express.Router();
const authHandler = require("../middlewares/authHandler");
const {
  getDocuments,
  createDocument,
  updateDocument,
  removeDocument,
} = require("../controllers/documentController");

router.use(authHandler);

// Get all documents
router.get("/", getDocuments);

// Create a new document
router.post("/", createDocument);

// Update a document
router.put("/:id", updateDocument);

// Delete a document
router.delete("/:id", removeDocument);

module.exports = router;
