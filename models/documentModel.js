const { default: mongoose } = require("mongoose");

const documentSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  currentlyEditing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Document", documentSchema);
