import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { File, Send, Type } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export const UploadManager = () => {
  const { lang, t, mode, setMode, handleFileChange, handleChooseFileClick, fileInputRef, handleUploadClick, selectedFile, text, setText, handleTextSendClick, getStatusMessage } = useAppContext();

  return (
    <>
      {/* --- Mode Toggle --- */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")} className="py-5 rounded-xl font-semibold">
          <File className="w-4 h-4 mr-2" />
          {t("toggleFile")}
        </Button>
        <Button variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")} className="py-5 rounded-xl font-semibold">
          <Type className="w-4 h-4 mr-2" />
          {t("toggleText")}
        </Button>
      </div>

      {/* --- Conditional: File Upload --- */}
      {mode === "file" && (
        <div className="space-y-3">
          <Label htmlFor="file-upload" className="font-medium text-slate-700 dark:text-slate-300">
            {t("selectFile")}
          </Label>
          <Button variant="outline" className="w-full" onClick={handleChooseFileClick}>
            {t("chooseFile")}
          </Button>
          <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button
            className="w-full py-5 rounded-2xl font-semibold text-lg bg-linear-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={handleUploadClick}
            disabled={!selectedFile}
          >
            {t("upload")}
          </Button>
        </div>
      )}

      {/* --- Conditional: Text Upload --- */}
      {mode === "text" && (
        <div className="space-y-3">
          <Label htmlFor="text-input" className="font-medium text-slate-700 dark:text-slate-300">
            {t("sendText")}
          </Label>
          <Textarea id="text-input" placeholder="Type your message or paste a link..." value={text} onChange={(e) => setText(e.target.value)} className="resize-none overflow-y-auto" rows={3} />
          <Button
            className="w-full py-5 rounded-2xl font-semibold text-lg bg-linear-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={handleTextSendClick}
            disabled={!text.trim()}
          >
            {t("sendText")} <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* --- Status Message --- */}
      <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">{getStatusMessage()}</p>
      </div>
    </>
  );
};
