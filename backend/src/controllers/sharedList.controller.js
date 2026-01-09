import SharedList from "../models/SharedList.js";
import User from "../models/User.js";

// Create a new shared list
export const createSharedList = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "List name is required" });
    }

    const newList = new SharedList({
      name,
      description,
      ownerId: req.user._id,
      collaborators: [],
      words: [],
    });

    await newList.save();
    await newList.populate("ownerId", "fullName profilePic");

    res.status(201).json(newList);
  } catch (error) {
    console.error("Error in createSharedList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get lists owned by user
export const getMySharedLists = async (req, res) => {
  try {
    const lists = await SharedList.find({ ownerId: req.user._id })
      .populate("ownerId", "fullName profilePic")
      .populate("collaborators", "fullName profilePic")
      .populate("words.contributorId", "fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(lists);
  } catch (error) {
    console.error("Error in getMySharedLists:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get lists shared with user (as collaborator)
export const getSharedWithMe = async (req, res) => {
  try {
    const lists = await SharedList.find({ collaborators: req.user._id })
      .populate("ownerId", "fullName profilePic")
      .populate("collaborators", "fullName profilePic")
      .populate("words.contributorId", "fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(lists);
  } catch (error) {
    console.error("Error in getSharedWithMe:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single shared list by ID
export const getSharedList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await SharedList.findById(id)
      .populate("ownerId", "fullName profilePic")
      .populate("collaborators", "fullName profilePic")
      .populate("words.contributorId", "fullName profilePic");

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Check if user has access
    const isOwner = list.ownerId._id.toString() === req.user._id.toString();
    const isCollaborator = list.collaborators.some(
      (c) => c._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(list);
  } catch (error) {
    console.error("Error in getSharedList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add a collaborator (share with friend)
export const addCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;

    const list = await SharedList.findOne({ _id: id, ownerId: req.user._id });

    if (!list) {
      return res.status(404).json({ message: "List not found or access denied" });
    }

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a collaborator
    if (list.collaborators.includes(friendId)) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    list.collaborators.push(friendId);
    await list.save();
    await list.populate("collaborators", "fullName profilePic");

    res.status(200).json(list);
  } catch (error) {
    console.error("Error in addCollaborator:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove a collaborator
export const removeCollaborator = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    const list = await SharedList.findOne({ _id: id, ownerId: req.user._id });

    if (!list) {
      return res.status(404).json({ message: "List not found or access denied" });
    }

    list.collaborators = list.collaborators.filter(
      (c) => c.toString() !== friendId
    );
    await list.save();

    res.status(200).json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Error in removeCollaborator:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add word to shared list
export const addWordToSharedList = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, translation, example, language } = req.body;

    if (!word || !translation) {
      return res.status(400).json({ message: "Word and translation are required" });
    }

    const list = await SharedList.findById(id);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Check if user has access
    const isOwner = list.ownerId.toString() === req.user._id.toString();
    const isCollaborator = list.collaborators.some(
      (c) => c.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied" });
    }

    list.words.push({
      word,
      translation,
      example,
      language,
      contributorId: req.user._id,
    });

    await list.save();
    await list.populate("words.contributorId", "fullName profilePic");

    res.status(201).json(list.words[list.words.length - 1]);
  } catch (error) {
    console.error("Error in addWordToSharedList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete word from shared list
export const deleteWordFromSharedList = async (req, res) => {
  try {
    const { id, wordId } = req.params;

    const list = await SharedList.findById(id);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const wordIndex = list.words.findIndex((w) => w._id.toString() === wordId);

    if (wordIndex === -1) {
      return res.status(404).json({ message: "Word not found" });
    }

    const wordContributor = list.words[wordIndex].contributorId.toString();
    const isOwner = list.ownerId.toString() === req.user._id.toString();
    const isContributor = wordContributor === req.user._id.toString();

    // Only owner or the word contributor can delete
    if (!isOwner && !isContributor) {
      return res.status(403).json({ message: "Access denied" });
    }

    list.words.splice(wordIndex, 1);
    await list.save();

    res.status(200).json({ message: "Word removed successfully" });
  } catch (error) {
    console.error("Error in deleteWordFromSharedList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete shared list (owner only)
export const deleteSharedList = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await SharedList.findOneAndDelete({
      _id: id,
      ownerId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({ message: "List not found or access denied" });
    }

    res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSharedList:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
