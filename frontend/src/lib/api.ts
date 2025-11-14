import { API_BASE } from "./sockets";

/**
 * Uploads the selected file to the server.
 */
export const uploadFile = async (selectedFile: File) => {
  const formData = new FormData();
  formData.append("file", selectedFile);

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

/**
 * Triggers a browser download for a given file.
 */
export const downloadFile = (filename: string) => {
  const link = document.createElement("a");
  link.href = `${API_BASE}/download/${filename}`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
