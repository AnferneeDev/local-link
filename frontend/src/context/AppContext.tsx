import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import translations from "../languages.json";
import { LanguageKey, SharedFile, SharedText, SharedItem } from "../lib/types";
import { socket } from "../lib/socket";
// We no longer import getIP, because it's handled by window.api or a new endpoint
import { getItems, uploadFiles, sendText, downloadFile, downloadAllFiles } from "../lib/api";
import { t as tHelper, getStatusMessage as getStatusHelper, tButton } from "../lib/translations";

interface AppContextType {
  // State
  files: SharedFile[];
  texts: SharedText[];
  lang: LanguageKey;
  mode: "file" | "text";
  statusType: "initial" | "selected" | "uploading-file" | "uploading-text" | "success-file" | "success-text" | "fail-file" | "fail-text";
  statusFilename: string;
  text: string;
  copiedId: string | null;
  selectedFiles: File[];
  localIP: string | null;
  qrCodeDataUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  downloadingFileId: string | null;
  uploadProgress: number | null;
  // State Setters
  setLang: (lang: LanguageKey) => void;
  setMode: (mode: "file" | "text") => void;
  setText: (text: string) => void;
  // Handlers
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void; // <-- ADDED
  handleUploadClick: () => Promise<void>;
  handleTextSendClick: () => Promise<void>;
  handleCopyClick: (text: string, id: string) => void;
  handleChooseFileClick: () => void;
  handleDownloadClick: (file: SharedFile) => void;
  handleDownloadAllClick: () => Promise<void>;
  // Helpers
  t: (key: Exclude<keyof (typeof translations)["en"], "status" | "button">) => string;
  tButton: (key: keyof (typeof translations)["en"]["button"]) => string;
  getStatusMessage: () => string;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

// --- (useStatusReset helper is unchanged) ---
const useStatusReset = (setStatusType: React.Dispatch<React.SetStateAction<AppContextType["statusType"]>>, currentStatus: AppContextType["statusType"]) => {
  useEffect(() => {
    if (currentStatus.startsWith("success-") || currentStatus.startsWith("fail-")) {
      const timer = setTimeout(() => {
        setStatusType("initial");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, setStatusType]);
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [texts, setTexts] = useState<SharedText[]>([]);
  const [lang, setLang] = useState<LanguageKey>(getInitialLang());
  const [statusType, setStatusType] = useState<AppContextType["statusType"]>("initial");
  const [statusFilename, setStatusFilename] = useState("");
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [localIP, setLocalIP] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useStatusReset(setStatusType, statusType);

  useEffect(() => {
    // --- (fetchInitialData is unchanged) ---
    const fetchInitialData = async () => {
      try {
        let initialItems: SharedItem[] = [];

        if (window.api) {
          console.log("Running in Electron (host) mode");
          const appData = await window.api.getAppData();
          setLocalIP(appData.ip);
          setQrCodeDataUrl(appData.qrCodeDataUrl);
          initialItems = await getItems();
        } else {
          console.log("Running in Browser (client) mode");
          const appDataResponse = await fetch("/app-data");
          const appData = await appDataResponse.json();
          setLocalIP(appData.ip);
          setQrCodeDataUrl(appData.qrCodeDataUrl);
          initialItems = await getItems();
        }

        setFiles((prevFiles) => {
          const newFiles = initialItems.filter((item) => item.type === "file") as SharedFile[];
          const existingIds = new Set(prevFiles.map((f) => f.id));
          const merged = [...prevFiles, ...newFiles.filter((f) => !existingIds.has(f.id))];
          return merged;
        });
        setTexts((prevTexts) => {
          const newTexts = initialItems.filter((item) => item.type === "text") as SharedText[];
          const existingIds = new Set(prevTexts.map((t) => t.id));
          const merged = [...prevTexts, ...newTexts.filter((t) => !existingIds.has(t.id))];
          return merged;
        });
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();

    // --- (socket logic is unchanged) ---
    socket.on("item-added", (newItem: SharedItem) => {
      if (newItem.type === "file") {
        setFiles((prev) => (prev.find((f) => f.id === newItem.id) ? prev : [...prev, newItem]));
      } else if (newItem.type === "text") {
        setTexts((prev) => (prev.find((t) => t.id === newItem.id) ? prev : [...prev, newItem]));
      }
    });
    socket.on("items-cleared", () => {
      setFiles([]);
      setTexts([]);
    });
    return () => {
      socket.off("item-added");
      socket.off("items-cleared");
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
      setStatusType("selected");
      const names = Array.from(event.target.files).map((f) => f.name);
      setStatusFilename(names.length === 1 ? names[0] : `${names.length} files`);
    }
  };

  // --- ADDED: handleDrop function ---
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
      setStatusType("selected");
      const names = Array.from(files).map((f) => f.name);
      setStatusFilename(names.length === 1 ? names[0] : `${names.length} files`);
    }
  };
  // --- END ---

  // --- (handleUploadClick is unchanged) ---
  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    setStatusType("uploading-file");
    setUploadProgress(0);
    const onProgress = (progress: number) => {
      setUploadProgress(progress);
    };
    try {
      await uploadFiles(selectedFiles, onProgress);
      setStatusType("success-file");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusType("fail-file");
    } finally {
      setUploadProgress(null);
    }
  };

  // --- (handleTextSendClick is unchanged) ---
  const handleTextSendClick = async () => {
    if (!text.trim()) return;
    setStatusType("uploading-text");
    try {
      await sendText(text);
      setStatusType("success-text");
      setText("");
    } catch (error) {
      console.error("Error sending text:", error);
      setStatusType("fail-text");
    }
  };

  // --- (handleCopyClick is unchanged) ---
  const handleCopyClick = (textToCopy: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (e) {
        console.error("Failed to copy", e);
      }
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  // --- (handleDownloadClick is unchanged) ---
  const handleDownloadClick = (file: SharedFile) => {
    setDownloadingFileId(file.id);
    downloadFile(file.filename);
    setTimeout(() => {
      setDownloadingFileId(null);
    }, 3000);
  };

  // --- (handleDownloadAllClick is unchanged) ---
  const handleDownloadAllClick = async () => {
    await downloadAllFiles(files, setDownloadingFileId);
  };

  // --- EXPOSE NEW HANDLER ---
  const value = {
    files,
    texts,
    lang,
    setLang,
    mode,
    setMode,
    statusType,
    statusFilename,
    text,
    setText,
    copiedId,
    selectedFiles,
    localIP,
    qrCodeDataUrl,
    fileInputRef,
    downloadingFileId,
    uploadProgress,
    handleFileChange,
    handleDrop, // <-- EXPOSED
    handleUploadClick,
    handleTextSendClick,
    handleCopyClick,
    handleChooseFileClick,
    handleDownloadClick,
    handleDownloadAllClick,
    t: (key: Exclude<keyof (typeof translations)["en"], "status" | "button">) => tHelper(lang, key),
    tButton: (key: keyof (typeof translations)["en"]["button"]) => tButton(lang, key),
    getStatusMessage: () => getStatusHelper(lang, statusType, statusFilename),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- (getInitialLang and useAppContext are unchanged) ---
const getInitialLang = (): LanguageKey => {
  const userLang = navigator.language.toLowerCase();
  return userLang.startsWith("es") ? "es" : "en";
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
