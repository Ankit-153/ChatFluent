import mongoose from "mongoose";

const sharedWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: { type: String, default: "" },
  language: { type: String, default: "" },
  contributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const sharedListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    words: [sharedWordSchema],
  },
  {
    timestamps: true,
  }
);

const SharedList = mongoose.model("SharedList", sharedListSchema);

export default SharedList;
