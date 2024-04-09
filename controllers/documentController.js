const Document = require("../models/documentModel");
const io = require("../configs/socket");
const generateShareableCode = require("../utils/generateShareableCode");

// Get all documents
const getDocuments = async (req, res, next) => {
  try {
    const userId = req.userId;
    const documents = await Document.find({
      $or: [{ creator: userId }, { collaborators: userId }],
    }).populate("collaborators", "creator"); // Populate collaborators field with username
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

// Get document
const getDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params; // Assuming you have access to the user ID from the request
    const userId = req.userId;

    // Find the document by ID
    const document = await Document.findOne({ _id: documentId });

    // If the document doesn't exist, return an error
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if the user is the creator of the document or a collaborator
    if (
      document.creator.toString() !== userId &&
      !document.collaborators.includes(userId)
    ) {
      return res.status(403).json({
        message: "You do not have permission to access this document",
      });
    }

    // User has permission, return the document
    res.status(200).json(document);
  } catch (error) {
    next(error);
  }
};

// Create a new document
const createDocument = async (req, res, next) => {
  try {
    // const { title, content } = req.body;
    const userId = req.userId; // Assuming you have access to the user ID from the request

    // Create the document with the creator's ID
    const newDocument = await Document.create({
      creator: userId,
      collaborators: [userId], // Add the creator's ID to collaborators
    });
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

// Update a document
const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { title, content } = req.body;

    // Update the document in the database
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { title, content },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Broadcast the document changes to all connected clients
    // Assuming you have access to the io object (Socket.IO instance) in the controller
    // io.emit("startEditing", {
    //   documentId,
    //   edits: { title, content },
    // });

    // Send the updated document back to the client
    res.status(200).json(updatedDocument);
  } catch (error) {
    next(error);
  }
};

const removeDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;
    // console.log(documentId);
    const deletedDocument = await Document.findOneAndDelete({
      _id: documentId,
      $or: [{ creator: userId }, { collaborators: userId }],
    });

    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Add collaborator to a document
const addCollaborator = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.collaborators.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    document.collaborators.push(userId);
    await document.save();

    res.status(200).json({ message: "Collaborator added successfully" });
  } catch (error) {
    next(error);
  }
};

// Generate a shareable link for a document
const generateShareCode = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Find the document by ID
    const document = await Document.findById(documentId);

    // Check if the document exists
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Generate a shareable link
    const shareableCode = generateShareableCode();

    // Update the document in the database with the shareable link
    document.shareCode = shareableCode;

    // Save the updated document
    await document.save();

    res.status(200).json(shareableCode);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get document by share code
const getDocumentByShareCode = async (req, res, next) => {
  try {
    const { shareCode } = req.params;
    
    let document = await Document.findOne({ shareCode });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const { userId } = req;

    if (!document.collaborators.includes(userId)) {
      document.collaborators.push(userId);
      document = await document.save();
    }

    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  removeDocument,
  addCollaborator,
  generateShareCode,
  getDocumentByShareCode,
};
