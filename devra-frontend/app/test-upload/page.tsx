/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResponse(null);

    try {
      console.log("Preparing to upload file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      formData.append("owner", "test-wallet-address");
      formData.append("name", file.name);
      formData.append("description", "Uploaded from test interface");

      console.log("Sending file with size:", file.size);
      console.log("FormData contains file?", formData.has("file"));

      const response = await fetch("http://localhost:5000//datasets/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (jsonErr) {
        console.error("Error parsing JSON response:", jsonErr);
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || `Server responded with ${response.status}`,
        );
      }

      setResponse(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-pink-500 flex items-center justify-center px-6">
      <div className="bg-[#1e1d1d] border border-gray-600 rounded-2xl px-8 py-10 w-full max-w-md">
        <h1 className="text-3xl font-light mb-2 text-white text-center">
          Test Upload
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Upload a file to test the encryption functionality
        </p>

        {/* File Upload Area */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-pink-500 transition duration-300 group"
          >
            <Upload className="w-8 h-8 text-gray-500 group-hover:text-pink-500 transition duration-300 mb-2" />
            <p className="text-sm text-gray-400 group-hover:text-pink-400 transition duration-300">
              Click to select a file
            </p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="mb-6 bg-black/30 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-gray-500 text-xs">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-500 cursor-pointer hover:text-red-400 transition duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Response */}
        {response && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg">
            <p className="text-green-400 text-sm font-medium">
              Encryption successful
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Path: {response.encryptedPath}
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full bg-pink-500 text-white py-3 rounded-full font-medium hover:bg-pink-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pink-500"
        >
          {uploading ? "Encrypting..." : "Encrypt File"}
        </button>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition duration-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
