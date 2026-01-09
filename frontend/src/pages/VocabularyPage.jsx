import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVocabulary, addVocabulary, deleteVocabulary, updateVocabulary, exportVocabulary, getMySharedLists, addWordToSharedList, generateWordDetails } from "../lib/api";
import { BookOpenIcon, PlusIcon, TrashIcon, SearchIcon, PencilIcon, DownloadIcon, ShareIcon, SparklesIcon } from "lucide-react";
import toast from "react-hot-toast";

const VocabularyPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" }); // date, word
  const [currentPage, setCurrentPage] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [wordToShare, setWordToShare] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const itemsPerPage = 6;

  const [newVocab, setNewVocab] = useState({
    word: "",
    translation: "",
    example: "",
    language: "",
  });

  const { data: vocabData, isLoading } = useQuery({
    queryKey: ["vocabulary", currentPage, searchTerm, sortConfig],
    queryFn: () =>
      getVocabulary({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sort: sortConfig.key === "date" ? "createdAt" : "word",
        order: sortConfig.direction,
      }),
  });

  const vocabList = vocabData?.vocab || [];
  const totalPages = vocabData?.pagination?.totalPages || 0;

  const { data: mySharedLists = [] } = useQuery({
    queryKey: ["my-shared-lists"],
    queryFn: getMySharedLists,
  });

  const shareToListMutation = useMutation({
    mutationFn: addWordToSharedList,
    onSuccess: () => {
      toast.success("Word shared to list!");
      setIsShareModalOpen(false);
      setWordToShare(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share word");
    },
  });

  const addVocabMutation = useMutation({
    mutationFn: addVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries(["vocabulary"]);
      toast.success("Word added to notebook!");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add word");
    },
  });

  const updateVocabMutation = useMutation({
    mutationFn: updateVocabulary,
    onSuccess: () => {
      queryClient.invalidateQueries(["vocabulary"]);
      toast.success("Word updated!");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update word");
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

  const openAddModal = () => {
    setEditingId(null);
    setNewVocab({ word: "", translation: "", example: "", language: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setNewVocab({
      word: item.word,
      translation: item.translation,
      example: item.example || "",
      language: item.language || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewVocab({ word: "", translation: "", example: "", language: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVocab.word || !newVocab.translation) {
      toast.error("Word and translation are required");
      return;
    }
    if (editingId) {
      updateVocabMutation.mutate({ id: editingId, ...newVocab });
    } else {
      addVocabMutation.mutate(newVocab);
    }
  };

  const handleAIFetch = async () => {
    if (!newVocab.word.trim()) {
      toast.error("Please enter a word first");
      return;
    }

    setIsAILoading(true);
    try {
      const aiData = await generateWordDetails(newVocab.word.trim());
      setNewVocab((prev) => ({
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

  const openShareModal = (item) => {
    setWordToShare(item);
    setIsShareModalOpen(true);
  };

  const handleShareToList = (listId) => {
    if (!wordToShare) return;
    shareToListMutation.mutate({
      listId,
      word: wordToShare.word,
      translation: wordToShare.translation,
      example: wordToShare.example || "",
      language: wordToShare.language || "",
    });
  };

  const handleExportCSV = async () => {
    try {
      const data = await exportVocabulary();
      if (data.length === 0) {
        toast.error("No words to export");
        return;
      }

      const headers = ["Word", "Translation", "Example", "Language", "Added Date"];
      const csvContent = [
        headers.join(","),
        ...data.map((item) =>
          [
            `"${item.word.replace(/"/g, '""')}"`,
            `"${item.translation.replace(/"/g, '""')}"`,
            `"${(item.example || "").replace(/"/g, '""')}"`,
            `"${(item.language || "").replace(/"/g, '""')}"`,
            `"${new Date(item.createdAt).toLocaleDateString()}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `vocabulary_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    try {
      const data = await exportVocabulary();
      if (data.length === 0) {
        toast.error("No words to export");
        return;
      }

      const printWindow = window.open("", "_blank");
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Vocabulary Notebook</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #007bff; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .example { font-style: italic; color: #666; }
            .language { background-color: #e9ecef; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>📚 Vocabulary Notebook</h1>
          <p>Exported on: ${new Date().toLocaleDateString()} | Total words: ${data.length}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Word</th>
                <th>Translation</th>
                <th>Example</th>
                <th>Language</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.word}</strong></td>
                  <td>${item.translation}</td>
                  <td class="example">${item.example || "-"}</td>
                  <td>${item.language ? `<span class="language">${item.language}</span>` : "-"}</td>
                  <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">Generated by ChatFluent Vocabulary Notebook</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("PDF ready for printing!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

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
          <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm sm:btn-md gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                <li><button onClick={handleExportCSV}>Export as CSV</button></li>
                <li><button onClick={handleExportPDF}>Export as PDF</button></li>
              </ul>
            </div>
            <button
              onClick={openAddModal}
              className="btn btn-primary btn-sm sm:btn-md gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add New Word
            </button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search your notebook..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="select select-bordered w-full sm:w-auto"
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split("-");
              setSortConfig({ key, direction });
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="word-asc">A-Z</option>
            <option value="word-desc">Z-A</option>
          </select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : vocabList.length === 0 ? (
          <div className="text-center py-12 bg-base-200/50 rounded-xl border border-base-300 border-dashed">
            <BookOpenIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
            <h3 className="text-lg font-medium">No words found</h3>
            <p className="text-base-content/60">Start adding words to your collection!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vocabList.map((item) => (
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => openShareModal(item)}
                          className="btn btn-ghost btn-xs btn-circle text-success/70 hover:text-success hover:bg-success/10"
                          title="Share to List"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-ghost btn-xs btn-circle text-info/70 hover:text-info hover:bg-info/10"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteVocabMutation.mutate(item._id)}
                          className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
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

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  <button
                    className="join-item btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    «
                  </button>
                  <button className="join-item btn pointer-events-none">
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="join-item btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">{editingId ? "Edit Word" : "Add New Word"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Word / Phrase</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Hola"
                    className="input input-bordered flex-1"
                    value={newVocab.word}
                    onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleAIFetch}
                    disabled={isAILoading || !newVocab.word.trim()}
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
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addVocabMutation.isPending || updateVocabMutation.isPending}
                >
                  {addVocabMutation.isPending || updateVocabMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Word"
                    : "Add Word"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share to List Modal */}
      {isShareModalOpen && wordToShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Share Word to List</h3>
            <p className="text-base-content/60 mb-4">
              Share "<strong>{wordToShare.word}</strong>" to a shared list
            </p>
            
            {mySharedLists.length === 0 ? (
              <div className="text-center py-6 bg-base-200/50 rounded-xl">
                <ShareIcon className="w-10 h-10 mx-auto text-base-content/30 mb-2" />
                <p className="text-base-content/60">No shared lists yet</p>
                <p className="text-sm text-base-content/40">Create a shared list first to share words</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mySharedLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => handleShareToList(list._id)}
                    disabled={shareToListMutation.isPending}
                    className="w-full flex items-center justify-between p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-medium">{list.name}</p>
                      <p className="text-xs text-base-content/50">
                        {list.words.length} words • {list.collaborators.length} collaborators
                      </p>
                    </div>
                    <ShareIcon className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setWordToShare(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
