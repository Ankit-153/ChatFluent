import Vocabulary from "../models/Vocabulary.js";

export const getVocabulary = async (req, res) => {
  try {
    const vocabList = await Vocabulary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(vocabList);
  } catch (error) {
    console.error("Error in getVocabulary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addVocabulary = async (req, res) => {
  try {
    const { word, translation, example, language } = req.body;

    if (!word || !translation) {
      return res.status(400).json({ message: "Word and translation are required" });
    }

    const newVocab = new Vocabulary({
      userId: req.user._id,
      word,
      translation,
      example,
      language,
    });

    await newVocab.save();

    res.status(201).json(newVocab);
  } catch (error) {
    console.error("Error in addVocabulary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const vocab = await Vocabulary.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!vocab) {
      return res.status(404).json({ message: "Vocabulary item not found" });
    }

    res.status(200).json({ message: "Vocabulary item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVocabulary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
