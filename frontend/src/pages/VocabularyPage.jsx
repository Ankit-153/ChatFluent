import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVocabulary, addVocabulary, deleteVocabulary } from "../lib/api";
import { BookOpenIcon, PlusIcon, TrashIcon, SearchIcon } from "lucide-react";
import toast from "react-hot-toast";

const VocabularyPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newVocab, setNewVocab] = useState({
    word: "",
    translation: "",
    example: "",
    language: "",
  });

  const { data: vocabList = [], isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: getVocabulary,
  });

  const addVocabMutation = useMutation({
    mutationFn: addVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries(["vocabulary"]);
      toast.success("Word added to notebook!");
      setIsModalOpen(false);
      setNewVocab({ word: "", translation: "", example: "", language: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add word");
    },
  });

  const deleteVocabMutation = useMutation({
    mutationFn: deleteVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries(["vocabulary"]);
      toast.success("Word removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove word");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVocab.word || !newVocab.translation) {
      toast.error("Word and translation are required");
      return;
    }
    addVocabMutation.mutate(newVocab);
  };

  const filteredVocab = vocabList.filter(
    (item) =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full bg-base-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-base-200 rounded-full">
              <BookOpenIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vocabulary Notebook</h1>
              <p className="text-base-content/60">Keep track of your new words</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm sm:btn-md gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Word
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search your notebook..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : filteredVocab.length === 0 ? (
          <div className="text-center py-12 bg-base-200/50 rounded-xl border border-base-300 border-dashed">
            <BookOpenIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
            <h3 className="text-lg font-medium">No words found</h3>
            <p className="text-base-content/60">Start adding words to your collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVocab.map((item) => (
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
                      onClick={() => deleteVocabMutation.mutate(item._id)}
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
                  
                  <div className="text-xs text-base-content/40 mt-2 text-right">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Add New Word</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Word / Phrase</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hola"
                  className="input input-bordered w-full"
                  value={newVocab.word}
                  onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Translation</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hello"
                  className="input input-bordered w-full"
                  value={newVocab.translation}
                  onChange={(e) => setNewVocab({ ...newVocab, translation: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Example Sentence (Optional)</span>
                </label>
                <textarea
                  placeholder="e.g. Hola, ¿cómo estás?"
                  className="textarea textarea-bordered h-24"
                  value={newVocab.example}
                  onChange={(e) => setNewVocab({ ...newVocab, example: e.target.value })}
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
                  value={newVocab.language}
                  onChange={(e) => setNewVocab({ ...newVocab, language: e.target.value })}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addVocabMutation.isPending}
                >
                  {addVocabMutation.isPending ? "Adding..." : "Add Word"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
