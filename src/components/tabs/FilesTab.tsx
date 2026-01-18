"use client";

import React, { useState, useEffect, useCallback } from "react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

function isFolder(file: DriveFile): boolean {
  return file.mimeType === "application/vnd.google-apps.folder";
}

function getFileIcon(mimeType: string): string {
  if (mimeType === "application/vnd.google-apps.folder") return "folder";
  if (mimeType === "application/vnd.google-apps.document") return "doc";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "sheet";
  if (mimeType === "application/vnd.google-apps.presentation") return "slides";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "file";
}

function formatFileSize(bytes?: string): string {
  if (!bytes) return "";
  const num = parseInt(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FileIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    folder: (
      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
    doc: (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
    sheet: (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" clipRule="evenodd" />
      </svg>
    ),
    slides: (
      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    image: (
      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    pdf: (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    ),
    file: (
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    ),
  };
  return <>{icons[type] || icons.file}</>;
}

export default function FilesTab() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "MAIL Files" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id;

  const fetchFiles = useCallback(async (folderId?: string, query?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (folderId && folderId !== "root") {
        params.set("folderId", folderId);
      }
      if (query) {
        params.set("q", query);
      }

      const response = await fetch(`/api/drive?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSearching) {
      fetchFiles(currentFolderId === "root" ? undefined : currentFolderId);
    }
  }, [currentFolderId, fetchFiles, isSearching]);

  const handleFolderClick = (folder: DriveFile) => {
    setIsSearching(false);
    setSearchQuery("");
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setIsSearching(false);
    setSearchQuery("");
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchFiles(currentFolderId === "root" ? undefined : currentFolderId);
      return;
    }
    setIsSearching(true);
    await fetchFiles(undefined, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    fetchFiles(currentFolderId === "root" ? undefined : currentFolderId);
  };

  return (
    <div className="p-6">
      {/* Quick Links */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Quick Links</h3>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://uofstthomasmn.sharepoint.com/sites/mail"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            SharePoint
          </a>
          <a
            href="https://teams.microsoft.com/l/team/19%3AKtFyT5oUtQcK5zd1jn6kukFfbXyDcrSGnHCHO3uqGFI1%40thread.tacv2/conversations?groupId=3cf6ce22-8fbd-4ff6-9155-f14a0c7b9cfb&tenantId=a081ff79-318c-45ec-95f3-38ebc2801472"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Teams
          </a>
          <a
            href="https://simplebooklet.com/casgraduatestudenthandbookandcoursecatalog#page=41"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            CAS Graduate Student Handbook
          </a>
          <a
            href="https://one.stthomas.edu/sites/academic-affairs/SitePageModern/90862/academic-administrators-resources"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Academic Administrators Resources
          </a>
          <a
            href="https://stthomas.instructure.com/courses/83583"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Canvas Hub
          </a>
          <a
            href="https://padlet.com/aileadership/ma-in-artificial-intelligence-leadership-mail-bulletin-eiwu4ka5qaeuffxu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Padlet Bulletin
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Files</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
          />
          {isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Breadcrumbs */}
      {!isSearching && (
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <span className="mx-1">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:text-gray-700 whitespace-nowrap ${
                  index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : ""
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}

      {isSearching && (
        <div className="text-sm text-gray-500 mb-4">
          Search results for "{searchQuery}"
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <span className="text-gray-400">Loading files...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          {isSearching ? "No files found" : "This folder is empty"}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-gray-700">Name</th>
                <th className="text-left py-2 px-4 font-medium text-gray-700 w-32">Modified</th>
                <th className="text-right py-2 px-4 font-medium text-gray-700 w-24">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 group"
                >
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3">
                      <FileIcon type={getFileIcon(file.mimeType)} />
                      {isFolder(file) ? (
                        <button
                          onClick={() => handleFolderClick(file)}
                          className="text-gray-900 hover:text-blue-600 font-medium text-left"
                        >
                          {file.name}
                        </button>
                      ) : (
                        <a
                          href={file.webViewLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-600"
                        >
                          {file.name}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-gray-500">
                    {formatDate(file.modifiedTime)}
                  </td>
                  <td className="py-2 px-4 text-gray-500 text-right">
                    {isFolder(file) ? "--" : formatFileSize(file.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Files are loaded from Google Drive. Click folders to navigate, or click files to open in Google Drive.
      </div>
    </div>
  );
}
