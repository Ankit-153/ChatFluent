import Vocabulary from "../models/Vocabulary.js";

export const getVocabulary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = { userId: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }

    const totalItems = await Vocabulary.countDocuments(query);
    const vocabList = await Vocabulary.find(query)
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      vocab: vocabList,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
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

export const updateVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, translation, example, language } = req.body;

    const vocab = await Vocabulary.findOne({ _id: id, userId: req.user._id });

    if (!vocab) {
      return res.status(404).json({ message: "Vocabulary item not found" });
    }

    vocab.word = word || vocab.word;
    vocab.translation = translation || vocab.translation;
    vocab.example = example !== undefined ? example : vocab.example;
    vocab.language = language !== undefined ? language : vocab.language;

    await vocab.save();

    res.status(200).json(vocab);
  } catch (error) {
    console.error("Error in updateVocabulary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exportVocabulary = async (req, res) => {
  try {
    const vocabList = await Vocabulary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(vocabList);
  } catch (error) {
    console.error("Error in exportVocabulary controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
