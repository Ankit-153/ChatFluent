import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySharedLists,
  getSharedWithMe,
  getSharedList,
  createSharedList,
  deleteSharedList,
  addCollaborator,
  removeCollaborator,
  addWordToSharedList,
  deleteWordFromSharedList,
  getUserFriends,
  generateWordDetails,
} from "../lib/api";
import {
  UsersIcon,
  PlusIcon,
  TrashIcon,
  ShareIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  XIcon,
  SparklesIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const SharedListsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("my-lists"); // my-lists, shared-with-me
  const [selectedList, setSelectedList] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [listToShare, setListToShare] = useState(null);
  const [newListData, setNewListData] = useState({ name: "", description: "" });
  const [newWord, setNewWord] = useState({ word: "", translation: "", example: "", language: "" });
  const [isAILoading, setIsAILoading] = useState(false);

  // Queries
  const { data: myLists = [], isLoading: loadingMyLists } = useQuery({
    queryKey: ["my-shared-lists"],
    queryFn: getMySharedLists,
  });

  const { data: sharedWithMe = [], isLoading: loadingSharedWithMe } = useQuery({
    queryKey: ["shared-with-me"],
    queryFn: getSharedWithMe,
  });

  const { data: selectedListData, isLoading: loadingSelectedList } = useQuery({
    queryKey: ["shared-list", selectedList],
    queryFn: () => getSharedList(selectedList),
    enabled: !!selectedList,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Mutations
  const createListMutation = useMutation({
    mutationFn: createSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries(["my-shared-lists"]);
      toast.success("List created!");
      setIsCreateModalOpen(false);
      setNewListData({ name: "", description: "" });
    },
    onError: (error) => toast.error(error.message || "Failed to create list"),
  });

  const deleteListMutation = useMutation({
    mutationFn: deleteSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries(["my-shared-lists"]);
      toast.success("List deleted!");
      setSelectedList(null);
    },
    onError: (error) => toast.error(error.message || "Failed to delete list"),
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: addCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-list", selectedList]);
      queryClient.invalidateQueries(["shared-list", listToShare?._id]);
      queryClient.invalidateQueries(["my-shared-lists"]);
      toast.success("Collaborator added!");
    },
    onError: (error) => toast.error(error.message || "Failed to add collaborator"),
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: removeCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-list", selectedList]);
      queryClient.invalidateQueries(["my-shared-lists"]);
      toast.success("Collaborator removed!");
    },
    onError: (error) => toast.error(error.message || "Failed to remove collaborator"),
  });

  const addWordMutation = useMutation({
    mutationFn: addWordToSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-list", selectedList]);
      toast.success("Word added!");
      setIsAddWordModalOpen(false);
      setNewWord({ word: "", translation: "", example: "", language: "" });
    },
    onError: (error) => toast.error(error.message || "Failed to add word"),
  });

  const deleteWordMutation = useMutation({
    mutationFn: deleteWordFromSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries(["shared-list", selectedList]);
      toast.success("Word removed!");
    },
    onError: (error) => toast.error(error.message || "Failed to remove word"),
  });

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListData.name) {
      toast.error("List name is required");
      return;
    }
    createListMutation.mutate(newListData);
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newWord.word || !newWord.translation) {
      toast.error("Word and translation are required");
      return;
    }
    addWordMutation.mutate({ listId: selectedList, ...newWord });
  };

  const handleAIFetch = async () => {
    if (!newWord.word.trim()) {
      toast.error("Please enter a word first");
      return;
    }

    setIsAILoading(true);
    try {
      const aiData = await generateWordDetails(newWord.word.trim());
      setNewWord((prev) => ({
        ...prev,
        translation: aiData.translation || prev.translation,
        example: aiData.example || prev.example,
        language: aiData.language || prev.language,
      }));
      toast.success("AI filled the details!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch AI suggestions");
    } finally {
      setIsAILoading(false);
    }
  };

  const availableFriendsToShare = friends.filter(
    (friend) => {
      const currentList = listToShare || selectedListData;
      return !currentList?.collaborators?.some((c) => c._id === friend._id);
    }
  );

  // Render list view
  if (selectedList && selectedListData) {
    const isOwner = selectedListData.ownerId._id === queryClient.getQueryData(["authUser"])?._id;

    return (
      <div className="p-4 sm:p-6 lg:p-8 h-full bg-base-100">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedList(null)}
              className="btn btn-ghost btn-circle"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{selectedListData.name}</h1>
              <p className="text-base-content/60">
                {selectedListData.description || "No description"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-base-content/50">
                <span>By {selectedListData.ownerId.fullName}</span>
                <span>•</span>
                <span>{selectedListData.words.length} words</span>
                <span>•</span>
                <span>{selectedListData.collaborators.length} collaborators</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="btn btn-ghost btn-sm gap-2"
                  >
                    <ShareIcon className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this list?")) {
                        deleteListMutation.mutate(selectedList);
                      }
                    }}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsAddWordModalOpen(true)}
                className="btn btn-primary btn-sm gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Word
              </button>
            </div>
          </div>

          {/* Collaborators */}
          <div className="flex flex-wrap gap-2">
            {selectedListData.collaborators.map((collab) => (
              <div
                key={collab._id}
                className="badge badge-lg gap-2 py-3"
              >
                <img
                  src={collab.profilePic}
                  alt={collab.fullName}
                  className="w-5 h-5 rounded-full"
                />
                {collab.fullName}
                {isOwner && (
                  <button
                    onClick={() =>
                      removeCollaboratorMutation.mutate({
                        listId: selectedList,
                        friendId: collab._id,
                      })
                    }
                    className="hover:text-error"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Words List */}
          {selectedListData.words.length === 0 ? (
            <div className="text-center py-12 bg-base-200/50 rounded-xl border border-base-300 border-dashed">
              <BookOpenIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
              <h3 className="text-lg font-medium">No words yet</h3>
              <p className="text-base-content/60">Start adding words to this shared list!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedListData.words.map((item) => (
                <div
                  key={item._id}
                  className="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/50 transition-colors"
                >
                  <div className="card-body p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{item.word}</h3>
                        <p className="text-lg font-medium opacity-80">{item.translation}</p>
                      </div>
                      <button
                        onClick={() =>
                          deleteWordMutation.mutate({
                            listId: selectedList,
                            wordId: item._id,
                          })
                        }
                        className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {item.example && (
                      <div className="mt-3 p-3 bg-base-200/50 rounded-lg text-sm italic border-l-2 border-primary/30">
                        "{item.example}"
                      </div>
                    )}

                    {item.language && (
                      <div className="mt-2">
                        <span className="badge badge-sm badge-ghost">{item.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-base-content/40">
                      <img
                        src={item.contributorId?.profilePic}
                        alt=""
                        className="w-4 h-4 rounded-full"
                      />
                      <span>Added by {item.contributorId?.fullName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="modal-box w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Share with Friends</h3>
              {availableFriendsToShare.length === 0 ? (
                <p className="text-base-content/60 py-4">
                  No friends available to add. Either all friends are already collaborators or you have no friends yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableFriendsToShare.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.profilePic}
                          alt={friend.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium">{friend.fullName}</span>
                      </div>
                      <button
                        onClick={() =>
                          addCollaboratorMutation.mutate({
                            listId: selectedList,
                            friendId: friend._id,
                          })
                        }
                        className="btn btn-primary btn-sm gap-1"
                        disabled={addCollaboratorMutation.isPending}
                      >
                        <UserPlusIcon className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => setIsShareModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Word Modal */}
        {isAddWordModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="modal-box w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Add Word to List</h3>
              <form onSubmit={handleAddWord} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Word / Phrase</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Hola"
                      className="input input-bordered flex-1"
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={handleAIFetch}
                      disabled={isAILoading || !newWord.word.trim()}
                      className="btn btn-secondary gap-2"
                      title="Auto-fill with AI"
                    >
                      {isAILoading ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <SparklesIcon className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">AI Fill</span>
                    </button>
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      Enter a word and click AI Fill to auto-generate details
                    </span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Translation</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hello"
                    className="input input-bordered w-full"
                    value={newWord.translation}
                    onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Example (Optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. Hola, ¿cómo estás?"
                    className="textarea textarea-bordered h-20"
                    value={newWord.example}
                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Language (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spanish"
                    className="input input-bordered w-full"
                    value={newWord.language}
                    onChange={(e) => setNewWord({ ...newWord, language: e.target.value })}
                  />
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsAddWordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addWordMutation.isPending}
                  >
                    {addWordMutation.isPending ? "Adding..." : "Add Word"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render lists overview
  const lists = activeTab === "my-lists" ? myLists : sharedWithMe;
  const isLoading = activeTab === "my-lists" ? loadingMyLists : loadingSharedWithMe;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full bg-base-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-base-200 rounded-full">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shared Lists</h1>
              <p className="text-base-content/60">Collaborate on vocabulary with friends</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm sm:btn-md gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create List
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed w-fit">
          <button
            className={`tab ${activeTab === "my-lists" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("my-lists")}
          >
            My Lists ({myLists.length})
          </button>
          <button
            className={`tab ${activeTab === "shared-with-me" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("shared-with-me")}
          >
            Shared with Me ({sharedWithMe.length})
          </button>
        </div>

        {/* Lists */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 bg-base-200/50 rounded-xl border border-base-300 border-dashed">
            <UsersIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
            <h3 className="text-lg font-medium">
              {activeTab === "my-lists"
                ? "No shared lists yet"
                : "No lists shared with you"}
            </h3>
            <p className="text-base-content/60">
              {activeTab === "my-lists"
                ? "Create a list and share it with friends!"
                : "Ask friends to share their lists with you!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lists.map((list) => (
              <div
                key={list._id}
                className="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/50 transition-colors"
              >
                <div className="card-body p-5">
                  <div className="flex justify-between items-start">
                    <h3
                      onClick={() => setSelectedList(list._id)}
                      className="text-xl font-bold text-primary cursor-pointer hover:underline"
                    >
                      {list.name}
                    </h3>
                    {activeTab === "my-lists" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setListToShare(list);
                          setIsShareModalOpen(true);
                        }}
                        className="btn btn-ghost btn-xs btn-circle text-success/70 hover:text-success hover:bg-success/10"
                        title="Share with friends"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p
                    onClick={() => setSelectedList(list._id)}
                    className="text-base-content/60 line-clamp-2 cursor-pointer"
                  >
                    {list.description || "No description"}
                  </p>
                  <div
                    onClick={() => setSelectedList(list._id)}
                    className="flex items-center justify-between mt-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm text-base-content/50">
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{list.words.length} words</span>
                    </div>
                    <div className="flex -space-x-2">
                      <img
                        src={list.ownerId.profilePic}
                        alt={list.ownerId.fullName}
                        className="w-6 h-6 rounded-full border-2 border-base-100"
                        title={list.ownerId.fullName}
                      />
                      {list.collaborators.slice(0, 3).map((collab) => (
                        <img
                          key={collab._id}
                          src={collab.profilePic}
                          alt={collab.fullName}
                          className="w-6 h-6 rounded-full border-2 border-base-100"
                          title={collab.fullName}
                        />
                      ))}
                      {list.collaborators.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100 flex items-center justify-center text-xs">
                          +{list.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Create Shared List</h3>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">List Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Travel Spanish"
                  className="input input-bordered w-full"
                  value={newListData.name}
                  onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <textarea
                  placeholder="What's this list about?"
                  className="textarea textarea-bordered h-24"
                  value={newListData.description}
                  onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createListMutation.isPending}
                >
                  {createListMutation.isPending ? "Creating..." : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Share Modal (from list card) */}
      {isShareModalOpen && listToShare && !selectedList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Share "{listToShare.name}"</h3>
            <p className="text-base-content/60 mb-4">Add friends as collaborators</p>
            {availableFriendsToShare.length === 0 ? (
              <p className="text-base-content/60 py-4">
                No friends available to add. Either all friends are already collaborators or you have no friends yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableFriendsToShare.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.profilePic}
                        alt={friend.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{friend.fullName}</span>
                    </div>
                    <button
                      onClick={() =>
                        addCollaboratorMutation.mutate({
                          listId: listToShare._id,
                          friendId: friend._id,
                        })
                      }
                      className="btn btn-primary btn-sm gap-1"
                      disabled={addCollaboratorMutation.isPending}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setListToShare(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedListsPage;
