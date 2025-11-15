import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { File, Send, Type, Loader2, FileText, UploadCloud, Files } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { tButton } from "../lib/translations"; // Import tButton
import { Progress } from "@/components/ui/progress"; // Import Progress

// --- Button text helpers ---
const FileButtonText = () => {
  const { lang, statusType, uploadProgress } = useAppContext();

  if (statusType === "uploading-file") {
    const progressText = uploadProgress ? `Uploading... ${uploadProgress}%` : tButton(lang, "uploading");
    return (
      <>
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {progressText}
      </>
    );
  }

  if (statusType === "success-file") return tButton(lang, "success");
  if (statusType === "fail-file") return tButton(lang, "fail");
  return tButton(lang, "upload");
};

const TextButtonText = () => {
  const { lang, statusType } = useAppContext();
  if (statusType === "uploading-text") {
    return (
      <>
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {tButton(lang, "sending")}
      </>
    );
  }
  if (statusType === "success-text") return tButton(lang, "success");
  if (statusType === "fail-text") return tButton(lang, "fail");
  return (
    <>
      {tButton(lang, "send")} <Send className="w-4 h-4 ml-2" />
    </>
  );
};

const FileUpload = () => {
  const {
    lang,
    t,
    handleFileChange,
    handleChooseFileClick,
    handleDrop, // <-- GET DROP HANDLER
    fileInputRef,
    handleUploadClick,
    selectedFiles,
    statusType,
    uploadProgress,
  } = useAppContext();

  const isUploadingFile = statusType === "uploading-file";

  // --- ADDED: Drag over handler ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is necessary to allow dropping
  };
  // --- END ---

  return (
    <div className="space-y-3">
      <div
        onClick={handleChooseFileClick}
        // --- ADDED: Drag and drop event handlers ---
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        // --- END ---
        className="flex items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="text-center">
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
              <UploadCloud className="w-8 h-8" />
              <span className="mt-1 text-sm font-medium">{t("dragDrop")}</span>
            </div>
          ) : selectedFiles.length === 1 ? (
            <div className="flex flex-col items-center text-slate-700 dark:text-slate-200">
              <FileText className="w-8 h-8" />
              <span className="mt-1 text-sm font-medium truncate max-w-[250px] md:max-w-[300px]">{selectedFiles[0].name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-700 dark:text-slate-200">
              <Files className="w-8 h-8" />
              <span className="mt-1 text-sm font-medium">{`${selectedFiles.length} files selected`}</span>
            </div>
          )}
        </div>
      </div>

      <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

      {isUploadingFile && uploadProgress !== null && (
        <div className="space-y-1 text-center pt-1">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-slate-500">{`${uploadProgress}% ${uploadProgress === 100 ? t("status.processing") : ""}`}</p>
        </div>
      )}

      <Button
        className="w-full py-5 rounded-2xl font-semibold text-lg bg-linear-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
        onClick={handleUploadClick}
        disabled={selectedFiles.length === 0 || isUploadingFile}
      >
        <FileButtonText />
      </Button>
    </div>
  );
};

// --- (TextUpload component is unchanged) ---
const TextUpload = () => {
  const { lang, t, text, setText, handleTextSendClick, statusType } = useAppContext();

  return (
    <div className="space-y-3">
      <Textarea id="text-input" placeholder={t("textPlaceholder")} value={text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)} className="resize-none h-24 overflow-y-auto" rows={3} />
      <Button
        className="w-full py-5 rounded-2xl font-semibold text-lg bg-linear-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
        onClick={handleTextSendClick}
        disabled={!text.trim() || statusType === "uploading-text"}
      >
        <TextButtonText />
      </Button>
    </div>
  );
};

// --- (UploadManager component is unchanged) ---
export const UploadManager = () => {
  const { lang, t, mode, setMode, getStatusMessage, statusType } = useAppContext();
  const statusMsg = getStatusMessage();

  return (
    <>
      {/* --- MOBILE: Show Toggles --- */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Button variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")} className="py-5 rounded-xl font-semibold">
          <File className="w-4 h-4 mr-2" />
          {t("toggleFile")}
        </Button>
        <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")} className="py-5 rounded-xl font-semibold">
          <Type className="w-4 h-4 mr-2" />
          {t("toggleText")}
        </Button>
      </div>

      {/* --- MOBILE: Conditional Render --- */}
      <div className="md:hidden">
        {mode === "file" && <FileUpload />}
        {mode === "text" && <TextUpload />}
      </div>

      {/* --- DESKTOP: Show Both Side-by-Side --- */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6 md:items-stretch">
        <FileUpload />
        <TextUpload />
      </div>

      {/* --- Status Message --- */}
      <div className="h-5 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{statusMsg}</p>
      </div>
    </>
  );
};
