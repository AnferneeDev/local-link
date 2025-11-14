import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2 } from "lucide-react"; // Import Loader2
import { useAppContext } from "../context/AppContext";

export const SharedFileList = () => {
  // --- 1. GET NEW PROPS FROM CONTEXT ---
  const { lang, t, tButton, files, handleDownloadClick, downloadingFileId } = useAppContext();

  return (
    <div className="space-y-3">
      <Label className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t("available")}</Label>
      {files.length === 0 ? (
        <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-400">{t("none")}</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {files.map((item) => {
            // --- 2. CHECK IF THIS FILE IS DOWNLOADING ---
            const isDownloading = downloadingFileId === item.id;

            return (
              <li key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px] md:max-w-[220px]">{item.filename}</span>
                <Button
                  size="sm"
                  variant="outline"
                  // --- 3. USE NEW HANDLER ---
                  onClick={() => handleDownloadClick(item)}
                  disabled={isDownloading} // Disable if downloading
                  className="h-8 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 w-28" // Fixed width for consistency
                >
                  {isDownloading ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Download className="w-3 h-3 mr-1.5" />}
                  {isDownloading ? tButton("downloading") : t("download")}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
