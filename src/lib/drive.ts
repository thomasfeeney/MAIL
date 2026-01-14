import { google } from "googleapis";

export function getGoogleDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export async function listFiles(
  accessToken: string,
  folderId?: string,
  pageToken?: string,
  pageSize: number = 50
): Promise<DriveListResponse> {
  const drive = getGoogleDriveClient(accessToken);

  // Build query - if folderId is specified, list files in that folder
  // Otherwise list files in root or all files
  let query = "trashed = false";
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }

  const response = await drive.files.list({
    q: query,
    pageSize,
    pageToken: pageToken || undefined,
    fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, parents)",
    orderBy: "folder, name",
  });

  return {
    files: (response.data.files || []) as DriveFile[],
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

export async function getFile(accessToken: string, fileId: string): Promise<DriveFile | null> {
  const drive = getGoogleDriveClient(accessToken);

  try {
    const response = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, parents",
    });
    return response.data as DriveFile;
  } catch {
    return null;
  }
}

export async function searchFiles(
  accessToken: string,
  query: string,
  pageSize: number = 20
): Promise<DriveFile[]> {
  const drive = getGoogleDriveClient(accessToken);

  const response = await drive.files.list({
    q: `name contains '${query}' and trashed = false`,
    pageSize,
    fields: "files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, thumbnailLink, parents)",
    orderBy: "modifiedTime desc",
  });

  return (response.data.files || []) as DriveFile[];
}

// Helper to determine if a file is a folder
export function isFolder(file: DriveFile): boolean {
  return file.mimeType === "application/vnd.google-apps.folder";
}

// Helper to get file type category for display
export function getFileCategory(mimeType: string): string {
  if (mimeType === "application/vnd.google-apps.folder") return "folder";
  if (mimeType === "application/vnd.google-apps.document") return "doc";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "sheet";
  if (mimeType === "application/vnd.google-apps.presentation") return "slides";
  if (mimeType === "application/vnd.google-apps.form") return "form";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("word") || mimeType.includes("document")) return "doc";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "sheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "slides";
  return "file";
}
