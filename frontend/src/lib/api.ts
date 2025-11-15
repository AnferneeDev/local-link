import { API_BASE } from "./socket";
import { SharedFile } from "./types"; // Import SharedFile type

/**
 * Uploads one or more files to the server, with progress tracking.
 */
export const uploadFiles = (selectedFiles: File[], onProgress: (progress: number) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    const xhr = new XMLHttpRequest();

    // --- This is the new progress tracking ---
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };
    // --- End of progress tracking ---

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed (XHR network error)"));
    };

    xhr.open("POST", `${API_BASE}/upload`, true);
    xhr.send(formData);
  });
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
    // Wait 500ms between each download to avoid pop-up blockers
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDownloadingFileId(null); // Hide spinner
  }
};
