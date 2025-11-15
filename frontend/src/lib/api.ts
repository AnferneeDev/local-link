import { API_BASE } from "./socket";
import { SharedFile } from "./types";

/**
 * Uploads one or more files to the server.
 */
export const uploadFiles = async (selectedFiles: File[]) => {
  const formData = new FormData();
  for (const file of selectedFiles) {
    formData.append("files", file); // 'files' (plural)
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  return await response.json();
};

/**
 * Sends a text snippet to the server.
 */
export const sendText = async (text: string) => {
  const response = await fetch(`${API_BASE}/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text }),
  });

  if (!response.ok) {
    throw new Error("Text send failed");
  }
  return await response.json();
};

export const getItems = async () => {
  const response = await fetch(`${API_BASE}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  return await response.json();
};

/**
 * Triggers a browser download for a single file.
 */
export const downloadFile = (filename: string) => {
  const link = document.createElement("a");
  link.href = `${API_BASE}/download/${filename}`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers downloads for all files, one by one.
 */
export const downloadAllFiles = async (files: SharedFile[], setDownloadingFileId: (id: string | null) => void) => {
  for (const file of files) {
    setDownloadingFileId(file.id); // Show spinner
    downloadFile(file.filename);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDownloadingFileId(null); // Hide spinner
  }
};

// --- THIS IS THE CHANGE ---
// We deleted the getIP() function.
// It will be replaced by window.api.getAppData() in the context.
