import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export const getStreamToken = async () => {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
};

export const getVocabulary = async (params) => {
    const response = await axiosInstance.get("/vocabulary", { params });
    return response.data;
};

export const addVocabulary = async (vocabData) => {
    const response = await axiosInstance.post("/vocabulary", vocabData);
    return response.data;
};

export const deleteVocabulary = async (id) => {
  const response = await axiosInstance.delete(`/vocabulary/${id}`);
  return response.data;
};

export const updateVocabulary = async ({ id, ...vocabData }) => {
  const response = await axiosInstance.put(`/vocabulary/${id}`, vocabData);
  return response.data;
};

export const exportVocabulary = async () => {
  const response = await axiosInstance.get("/vocabulary/export");
  return response.data;
};

// AI API
export const generateWordDetails = async (word, targetLanguage) => {
  const response = await axiosInstance.post("/ai/word-details", { word, targetLanguage });
  return response.data;
};

// Shared Lists API
export const createSharedList = async (listData) => {
  const response = await axiosInstance.post("/shared-lists", listData);
  return response.data;
};

export const getMySharedLists = async () => {
  const response = await axiosInstance.get("/shared-lists/my-lists");
  return response.data;
};

export const getSharedWithMe = async () => {
  const response = await axiosInstance.get("/shared-lists/shared-with-me");
  return response.data;
};

export const getSharedList = async (id) => {
  const response = await axiosInstance.get(`/shared-lists/${id}`);
  return response.data;
};

export const addCollaborator = async ({ listId, friendId }) => {
  const response = await axiosInstance.post(`/shared-lists/${listId}/collaborator`, { friendId });
  return response.data;
};

export const removeCollaborator = async ({ listId, friendId }) => {
  const response = await axiosInstance.delete(`/shared-lists/${listId}/collaborator/${friendId}`);
  return response.data;
};

export const addWordToSharedList = async ({ listId, ...wordData }) => {
  const response = await axiosInstance.post(`/shared-lists/${listId}/word`, wordData);
  return response.data;
};

export const deleteWordFromSharedList = async ({ listId, wordId }) => {
  const response = await axiosInstance.delete(`/shared-lists/${listId}/word/${wordId}`);
  return response.data;
};

export const deleteSharedList = async (id) => {
  const response = await axiosInstance.delete(`/shared-lists/${id}`);
  return response.data;
};


export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}
