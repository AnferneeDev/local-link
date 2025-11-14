import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
// --- 1. ADD MISSING IMPORTS ---
import translations from "../languages.json";
import { LanguageKey, SharedFile, SharedText, SharedItem } from "../lib/types";
import { socket } from "../lib/socket";
// Import 'getIP' and remove unused 'downloadFile'
import { getItems, uploadFile, sendText, getIP } from "../lib/api";
// Import helpers and rename them to avoid conflicts
import { t as tHelper, getStatusMessage as getStatusHelper } from "../lib/translations";

// 1. Define the shape of our context
interface AppContextType {
  // State
  files: SharedFile[];
  texts: SharedText[];
  lang: LanguageKey;
  mode: "file" | "text";
  statusType: string;
  statusFilename: string;
  text: string;
  copiedId: string | null;
  selectedFile: File | null;
  localIP: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;

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

  // Helpers
  t: (key: Exclude<keyof (typeof translations)["en"], "status">) => string;
  getStatusMessage: () => string;
}

// 2. Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Create the Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [texts, setTexts] = useState<SharedText[]>([]);
  const [lang, setLang] = useState<LanguageKey>("en");
  const [statusType, setStatusType] = useState("initial");
  const [statusFilename, setStatusFilename] = useState("");
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [localIP, setLocalIP] = useState<string | null>(null);

  // --- 2. FIX 'useEffect' (getIP was missing) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const initialItems: SharedItem[] = await getItems();
        const initialFiles = initialItems.filter((item) => item.type === "file") as SharedFile[];
        const initialTexts = initialItems.filter((item) => item.type === "text") as SharedText[];
        setFiles(initialFiles);
        setTexts(initialTexts);

        const ipData = await getIP(); // This now works
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
    setStatusType("uploading");
    try {
      await uploadFile(selectedFile);
      setStatusType("success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusType("fail");
    }
  };

  const handleTextSendClick = async () => {
    if (!text.trim()) return;
    setStatusType("uploading");
    try {
      await sendText(text);
      setStatusType("success");
      setText("");
    } catch (error) {
      console.error("Error sending text:", error);
      setStatusType("fail");
    }
  };

  const handleCopyClick = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  // --- 3. FIX THE 'value' OBJECT ---
  // It needs to use the imported helper functions
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
    handleFileChange,
    handleUploadClick,
    handleTextSendClick,
    handleCopyClick,
    handleChooseFileClick,
    // Use the renamed 'tHelper' and 'getStatusHelper'
    t: (key: Exclude<keyof (typeof translations)["en"], "status">) => tHelper(lang, key),
    getStatusMessage: () => getStatusHelper(lang, statusType, statusFilename),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 4. Create the Custom Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
