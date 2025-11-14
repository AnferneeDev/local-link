import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
// --- 1. IMPORT NEW ICONS ---
import { Download, Send, FileText, Copy, Check, File, Type } from "lucide-react";

// --- Logic Imports ---
import { LanguageKey, SharedFile, SharedText, SharedItem } from "./lib/types";
import { socket } from "./lib/socket";
import { t, getStatusMessage } from "./lib/translations";
import { uploadFile, sendText, downloadFile } from "./lib/api";

function App() {
  // --- State Management ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [texts, setTexts] = useState<SharedText[]>([]);
  const [lang, setLang] = useState<LanguageKey>("en");
  const [statusType, setStatusType] = useState("initial");
  const [statusFilename, setStatusFilename] = useState("");
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. ADD MODE STATE ---
  const [mode, setMode] = useState<"file" | "text">("file");

  // --- Socket Listeners (No Change) ---
  useEffect(() => {
    socket.on("item-added", (newItem: SharedItem) => {
      if (newItem.type === "file") {
        setFiles((prev: SharedFile[]) => [...prev, newItem]);
      } else if (newItem.type === "text") {
        setTexts((prev: SharedText[]) => [...prev, newItem]);
      }
    });
    // ... (rest of useEffect)
  }, []);

  // --- Event Handlers (No Change) ---
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

  return (
    <div className="min-h-dvh flex items-center justify-center bg-linear-to-br from-indigo-100 via-slate-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-6">
      <Card className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl rounded-3xl">
        {/* --- Language Toggle (No Change) --- */}
        <div className="absolute top-4 right-4 flex space-x-1 z-10">
          <Button variant={lang === "en" ? "default" : "ghost"} size="sm" className="h-7 w-10 text-xs" onClick={() => setLang("en")}>
            EN
          </Button>
          <Button variant={lang === "es" ? "default" : "ghost"} size="sm" className="h-7 w-10 text-xs" onClick={() => setLang("es")}>
            ES
          </Button>
        </div>

        {/* --- Header (No Change) --- */}
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">Local Link</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{t(lang, "description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* --- 3. ADD MODE TOGGLE --- */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")} className="py-5 rounded-xl font-semibold">
              <File className="w-4 h-4 mr-2" />
              {t(lang, "toggleFile")}
            </Button>
            <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")} className="py-5 rounded-xl font-semibold">
              <Type className="w-4 h-4 mr-2" />
              {t(lang, "toggleText")}
            </Button>
          </div>

          {/* --- 4. CONDITIONAL RENDER: FILE UPLOAD --- */}
          {mode === "file" && (
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="font-medium text-slate-700 dark:text-slate-300">
                {t(lang, "selectFile")}
              </Label>
              <Button variant="outline" className="w-full" onClick={handleChooseFileClick}>
                {t(lang, "chooseFile")}
              </Button>
              <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <Button
                className="w-full py-5 rounded-2xl font-semibold text-lg bg-linear-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={handleUploadClick}
                disabled={!selectedFile}
              >
                {t(lang, "upload")}
              </Button>
            </div>
          )}

          {/* --- 5. CONDITIONAL RENDER: TEXT UPLOAD --- */}
          {mode === "text" && (
            <div className="space-y-3">
              <Label htmlFor="text-input" className="font-medium text-slate-700 dark:text-slate-300">
                {t(lang, "sendText")}
              </Label>
              <Textarea id="text-input" placeholder="Type your message or paste a link..." value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} className="resize-none" />
              <Button className="w-full" onClick={handleTextSendClick} disabled={!text.trim()}>
                {t(lang, "sendText")} <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* --- Status Message (No Change) --- */}
          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">{getStatusMessage(lang, statusType, statusFilename)}</p>
          </div>

          {/* --- Shared Text List (No Change) --- */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t(lang, "sharedText")}</Label>
            {texts.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-400">{t(lang, "noneText")}</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {texts.map((item: SharedText) => (
                  <li key={item.id} className="relative p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-700 dark:text-slate-200 wrap-break-word pr-12">{item.content}</p>
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleCopyClick(item.content, item.id)}>
                      {copiedId === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* --- Shared File List (No Change) --- */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t(lang, "available")}</Label>
            {files.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-400">{t(lang, "none")}</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {files.map((item: SharedFile) => (
                  <li key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <FileText className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{item.filename}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(item.filename)} className="h-8 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                      <Download className="w-3 h-3 mr-1.5" />
                      {t(lang, "download")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>

        {/* --- 6. REMOVE FOOTER CONTENT --- */}
        <CardFooter />
      </Card>
    </div>
  );
}

export default App;
