import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      default: "",
    },
    language: {
      type: String, // e.g., "Spanish", "French" - optional but good to track
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: Partition by userId first, then text search
vocabularySchema.index({ userId: 1, word: "text", translation: "text" });

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);

export default Vocabulary;
