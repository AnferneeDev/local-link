import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import translations from "../languages.json";
import { LanguageKey, SharedFile, SharedText, SharedItem } from "../lib/types";
import { socket } from "../lib/socket";
import { getItems, uploadFiles, sendText, downloadFile, getIP, downloadAllFiles } from "../lib/api";
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
  selectedFiles: File[]; // <-- CHANGED
  localIP: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  downloadingFileId: string | null;
  // State Setters
  setLang: (lang: LanguageKey) => void;
  setMode: (mode: "file" | "text") => void;
  setText: (text: string) => void;
  // Handlers
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadClick: () => Promise<void>;
  handleTextSendClick: () => Promise<void>;
  handleCopyClick: (text: string, id: string) => void;
  handleChooseFileClick: () => void;
  handleDownloadClick: (file: SharedFile) => void;
  handleDownloadAllClick: () => Promise<void>; // <-- ADDED
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // <-- CHANGED
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
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useStatusReset(setStatusType, statusType);

  useEffect(() => {
    // ... (fetchInitialData is unchanged) ...
    const fetchInitialData = async () => {
      try {
        const initialItems: SharedItem[] = await getItems();
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

        const ipData = await getIP();
        if (ipData.ip) setLocalIP(ipData.ip);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();

    // ... (socket logic is unchanged) ...
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

  // --- UPDATED to handle multiple files ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files)); // Store as array
      setStatusType("selected");
      const names = Array.from(event.target.files).map((f) => f.name);
      setStatusFilename(names.length === 1 ? names[0] : `${names.length} files`);
    }
  };

  // --- UPDATED to handle multiple files ---
  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    setStatusType("uploading-file");
    try {
      await uploadFiles(selectedFiles); // Use plural function
      setStatusType("success-file");
      setSelectedFiles([]); // Clear array
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusType("fail-file");
    }
  };

  const handleTextSendClick = async () => {
    // (This handler is unchanged)
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

  const handleCopyClick = (textToCopy: string, id: string) => {
    // (This handler is unchanged)
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

  const handleDownloadClick = (file: SharedFile) => {
    // (This handler is unchanged)
    setDownloadingFileId(file.id);
    downloadFile(file.filename);
    setTimeout(() => {
      setDownloadingFileId(null);
    }, 3000);
  };

  // --- ADDED: New handler for "Download All" ---
  const handleDownloadAllClick = async () => {
    // Calls the new API function
    await downloadAllFiles(files, setDownloadingFileId);
  };

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
    selectedFiles, // <-- CHANGED
    localIP,
    fileInputRef,
    downloadingFileId,
    handleFileChange,
    handleUploadClick,
    handleTextSendClick,
    handleCopyClick,
    handleChooseFileClick,
    handleDownloadClick,
    handleDownloadAllClick, // <-- ADDED
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
