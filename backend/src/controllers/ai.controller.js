import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateWordDetails = async (req, res) => {
  try {
    const { word, targetLanguage } = req.body;

    if (!word) {
      return res.status(400).json({ message: "Word is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    const prompt = `You are a language learning assistant. Given the following word or phrase, provide:
1. The English translation (if the word is not in English) OR the most common meaning (if it's an English word)
2. An example sentence using this word in its original language
3. Detect what language the word is in

Word: "${word}"
${targetLanguage ? `The user expects this word to be in: ${targetLanguage}` : ""}

Respond ONLY in this exact JSON format, no markdown, no code blocks:
{"translation": "the translation", "example": "example sentence using the word", "language": "detected language name"}

Rules:
- If the word appears to be English, provide a definition as the translation and still provide an example
- The example should be a practical, everyday sentence
- The language should be the full name (e.g., "Spanish", "French", "Japanese", "English")
- Keep responses concise and helpful for language learners`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text.trim();

    // Parse the JSON response
    let parsed;
    try {
      // Remove any potential markdown code blocks
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return res.status(500).json({ message: "Failed to parse AI response" });
    }

    res.status(200).json({
      translation: parsed.translation || "",
      example: parsed.example || "",
      language: parsed.language || "",
    });
  } catch (error) {
    console.error("Error in generateWordDetails controller:", error.message);
    res.status(500).json({ message: "Failed to generate word details" });
  }
};
