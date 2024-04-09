const express = require("express");
const router = express.Router();
const authHandler = require("../middlewares/authHandler");
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  removeDocument,
  generateShareCode,
  getDocumentByShareCode,
} = require("../controllers/documentController");

router.use(authHandler);

// Get all documents
router.get("/", getDocuments);

// Get document
router.get("/:documentId", getDocument);

// Create a new document
router.post("/", createDocument);

// Update a document
router.put("/:documentId", updateDocument);

// Delete a document
router.delete("/:documentId", removeDocument);

// Generate shareable link for a document
router.post("/:documentId/share", generateShareCode);

// Get document by share code
router.get("/share/:shareCode", getDocumentByShareCode);

module.exports = router;
