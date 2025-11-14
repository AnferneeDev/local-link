import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import translations from "../languages.json";
import { LanguageKey, SharedFile, SharedText, SharedItem } from "../lib/types";
import { socket } from "../lib/socket";
import { getItems, uploadFile, sendText, getIP, downloadFile } from "../lib/api"; // Added downloadFile back
import { t as tHelper, getStatusMessage as getStatusHelper, tButton } from "../lib/translations"; // Added tButton

// --- 1. NEW HELPER FUNCTION ---
// This checks the browser's language
const getInitialLang = (): LanguageKey => {
  // navigator.language returns 'es-ES', 'es', 'en-US', 'en', etc.
  const userLang = navigator.language.toLowerCase();
  return userLang.startsWith("es") ? "es" : "en";
};
// --- END OF NEW FUNCTION ---

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
  selectedFile: File | null;
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

  // Helpers
  t: (key: Exclude<keyof (typeof translations)["en"], "status" | "button">) => string;
  tButton: (key: keyof (typeof translations)["en"]["button"]) => string; // --- MODIFIED: Added tButton ---
  getStatusMessage: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// (useStatusReset helper function is unchanged)
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [texts, setTexts] = useState<SharedText[]>([]);

  // --- 2. MODIFIED: Use the helper function to set initial state ---
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
    const fetchInitialData = async () => {
      try {
        const initialItems: SharedItem[] = await getItems();
        const initialFiles = initialItems.filter((item) => item.type === "file") as SharedFile[];
        const initialTexts = initialItems.filter((item) => item.type === "text") as SharedText[];
        setFiles(initialFiles);
        setTexts(initialTexts);

        const ipData = await getIP();
        if (ipData.ip) setLocalIP(ipData.ip);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();

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
      setSelectedFile(event.target.files[0]);
      setStatusType("selected");
      setStatusFilename(event.target.files[0].name);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    setStatusType("uploading-file");
    try {
      await uploadFile(selectedFile);
      setStatusType("success-file");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusType("fail-file");
    }
  };

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

  const handleDownloadClick = (file: SharedFile) => {
    setDownloadingFileId(file.id);
    downloadFile(file.filename);
    setTimeout(() => {
      setDownloadingFileId(null);
    }, 3000);
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
    selectedFile,
    localIP,
    fileInputRef,
    downloadingFileId,
    handleFileChange,
    handleUploadClick,
    handleTextSendClick,
    handleCopyClick,
    handleChooseFileClick,
    handleDownloadClick,
    t: (key: Exclude<keyof (typeof translations)["en"], "status" | "button">) => tHelper(lang, key),
    // --- 3. MODIFIED: Added tButton to the context value ---
    tButton: (key: keyof (typeof translations)["en"]["button"]) => tButton(lang, key),
    getStatusMessage: () => getStatusHelper(lang, statusType, statusFilename),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
