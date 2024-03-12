const Document = require("../models/documentModel");

// Get all documents
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find().populate(
      "collaborators",
      "username"
    ); // Populate collaborators field with username
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

// Create a new document
const createDocument = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.userId; // Assuming you have access to the user ID from the request

    const newDocument = await Document.create({
      title,
      content,
      creator: userId,
    });
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

// Update a document
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Update the document in the database
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Broadcast the document changes to all connected clients
    // Assuming you have access to the io object (Socket.IO instance) in the controller
    io.emit("documentEdited", updatedDocument);

    // Send the updated document back to the client
    res.status(200).json(updatedDocument);
  } catch (error) {
    next(error);
  }
};

const removeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.creator.equals(userId)) {
      // User is the creator of the document, delete it
      await document.remove();
      return res.status(200).json({ message: "Document deleted successfully" });
    }

    const collaboratorIndex = document.collaborators.indexOf(userId);
    if (collaboratorIndex === -1) {
      // User is neither creator nor collaborator, return forbidden
      return res
        .status(403)
        .json({ message: "User is not authorized to delete the document" });
    }

    // User is a collaborator, remove them from the collaborators list
    document.collaborators.splice(collaboratorIndex, 1);

    // If the user was the last collaborator, designate the document's creator as the new owner
    if (document.collaborators.length === 0) {
      document.creator = userId;
    }

    await document.save();
    return res.status(200).json({ message: "User removed from collaborators" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  createDocument,
  updateDocument,
  removeDocument,
};
