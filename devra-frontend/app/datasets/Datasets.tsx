import React, { useState } from "react";
import {
  Database,
  FileText,
  CheckCircle,
  TrendingUp,
  Upload,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Banner from "./components/Banner";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";

type StatusType = "Low" | "Medium" | "High";

interface Dataset {
  id: number;
  name: string;
  score: string;
  creator: string;
  date: string;
}

export default function Datasets() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const randomHex = (len = 40) =>
    Array.from({ length: len })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");

  const randomAddress = () => `0x${randomHex(40)}`;

  const [datasets] = useState<Dataset[]>(() => [
    {
      id: 1,
      name: "echo_list_extracted.zip",
      score: "75%",
      creator: randomAddress(),
      date: "Oct 7, 2025 14:32",
    },
    {
      id: 2,
      name: "TAVARI – The Intelligent Agent Hub.zip",
      score: "75%",
      creator: randomAddress(),
      date: "Oct 7, 2025 14:28",
    },
    {
      id: 3,
      name: "firefox229363password.zip",
      score: "40%",
      creator: randomAddress(),
      date: "Oct 7, 2025 14:15",
    },
    {
      id: 4,
      name: "customer_feedback_dataset.zip",
      score: "88%",
      creator: randomAddress(),
      date: "Oct 7, 2025 13:45",
    },
    {
      id: 5,
      name: "social_media_comments.zip",
      score: "62%",
      creator: randomAddress(),
      date: "Oct 7, 2025 12:20",
    },
    {
      id: 6,
      name: "product_reviews_cleaned.zip",
      score: "91%",
      creator: randomAddress(),
      date: "Oct 7, 2025 11:58",
    },
    {
      id: 7,
      name: "user_generated_content.zip",
      score: "35%",
      creator: randomAddress(),
      date: "Oct 7, 2025 11:22",
    },
    {
      id: 8,
      name: "support_tickets_archive.zip",
      score: "78%",
      creator: randomAddress(),
      date: "Oct 7, 2025 10:45",
    },
    {
      id: 9,
      name: "forum_posts_batch_01.zip",
      score: "82%",
      creator: randomAddress(),
      date: "Oct 7, 2025 09:30",
    },
    {
      id: 10,
      name: "chat_logs_anonymized.zip",
      score: "58%",
      creator: randomAddress(),
      date: "Oct 7, 2025 09:12",
    },
    {
      id: 11,
      name: "email_dataset_filtered.zip",
      score: "93%",
      creator: randomAddress(),
      date: "Oct 6, 2025 18:45",
    },
    {
      id: 12,
      name: "survey_responses_2025.zip",
      score: "67%",
      creator: randomAddress(),
      date: "Oct 6, 2025 17:20",
    },
  ]);

  const totalPages = Math.ceil(datasets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDatasets = datasets.slice(startIndex, endIndex);

  const parseScoreValue = (score: string | number) => {
    if (typeof score === "number") {
      return score <= 1 ? score * 100 : score;
    }
    const s = String(score).trim();
    if (s.endsWith("%")) {
      const n = parseFloat(s.slice(0, -1));
      return Number.isNaN(n) ? 0 : n;
    }
    const n = parseFloat(s);
    if (Number.isNaN(n)) return 0;
    return n <= 1 ? n * 100 : n;
  };

  const calculateAverageQuality = (items: Dataset[]) => {
    if (!items.length) return "0%";
    const total = items.reduce((acc, it) => acc + parseScoreValue(it.score), 0);
    const avg = total / items.length;
    return `${avg.toFixed(0)}%`; // round to nearest percent; change to toFixed(1) for one decimal
  };

  const avgQuality = calculateAverageQuality(datasets);

  // ...existing code...

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No uploads yet
      </h3>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Start by minting your first dataset to the decentralized marketplace.
      </p>
      <button
        onClick={() => setUploadModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 cursor-pointer text-white rounded-full hover:bg-pink-600 transition-colors font-medium"
      >
        <Upload className="w-4 h-4" />
        Upload Your First Dataset
      </button>
    </div>
  );

  return (
    <div className="min-h-screen mt-16 text-white">
      <div className="w-full relative">
        {/* Header */}
        <div className="m-0 p-0">
          <Banner />
        </div>
        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Total Datasets</p>
                  <p className="text-3xl font-bold text-white">
                    {datasets.length}
                  </p>
                </div>
                <Database className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-pink-600/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Total Size</p>
                  <p className="text-3xl font-bold text-white">17 GB</p>
                </div>
                <FileText className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-pink-600/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Avg Quality</p>
                  <p className="text-3xl font-bold text-white">{avgQuality}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-pink-600/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Total Value</p>
                  <p className="text-3xl font-bold text-white">12 PAS</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border border-pink-500/20 overflow-hidden">
            {datasets.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-white border-b border-pink-500/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Dataset Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-500/20">
                      {currentDatasets.map((dataset) => (
                        <tr key={dataset.id} className="transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="w-5 h-5 text-pink-600" />
                              </div>
                              <span className="text-sm font-medium text-white truncate max-w-md">
                                {dataset.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-pink-600" />
                              <span className="text-sm font-semibold text-white">
                                {dataset.score}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full bg-pink-600"
                                aria-hidden="true"
                              />
                              <span
                                title={dataset.creator}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-pink-600 text-white"
                              >
                                {truncateAddress(dataset.creator)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-white">
                              <Calendar className="w-4 h-4 text-pink-600" />
                              {dataset.date}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-pink-500/20 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, datasets.length)}
                    </span>{" "}
                    of <span className="font-medium">{datasets.length}</span>{" "}
                    datasets
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-pink-500/20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-pink-600 text-white"
                                : "text-gray-600 hover:bg-white border border-pink-500/20"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-pink-500/20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
