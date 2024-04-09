const { default: mongoose } = require("mongoose");

const documentSchema = mongoose.Schema({
  title: {
    type: String,
    default: "New Document",
  },
  content: {
    type: String,
    default: "",
  },
  collaborators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  currentlyEditing: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shareCode: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model("Document", documentSchema);
