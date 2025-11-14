import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2, Package } from "lucide-react"; // --- 1. IMPORT 'Package' ICON ---
import { useAppContext } from "../context/AppContext";
import { API_BASE } from "../lib/socket"; // --- 2. IMPORT 'API_BASE' ---
import { downloadFile } from "../lib/api"; // <-- This is now just for the loop

export const SharedFileList = () => {
  const {
    lang,
    t,
    files,
    handleDownloadClick,
    downloadingFileId,
    handleDownloadAllClick, // --- 3. GET NEW HANDLER ---
  } = useAppContext();

  return (
    <div className="space-y-3">
      {/* --- 4. ADD "DOWNLOAD ALL" BUTTON --- */}
      <div className="flex justify-between items-center mb-2">
        <Label className="font-medium text-slate-700 dark:text-slate-300">{t("available")}</Label>
        {files.length > 1 && ( // Only show if there's more than one file
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleDownloadAllClick} // <-- Use new handler
          >
            <Package className="w-3 h-3 mr-1.5" />
            Download All
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-center py-4 ...">
          <p className="text-sm text-slate-400">{t("none")}</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {files.map((item) => {
            const isDownloading = downloadingFileId === item.id;

            return (
              <li key={item.id} className="flex items-center justify-between p-3 ...">
                <FileText className="w-4 h-4 mr-2 text-slate-500 shrink-0" />

                {/* --- 5. FILENAME IS NOW A PREVIEW LINK --- */}
                <a
                  href={`${API_BASE}/file/${item.filename}`} // Serve file directly
                  target="_blank" // Open in new tab
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px] md:max-w-[220px] hover:underline"
                  title={`Click to preview ${item.filename}`}
                >
                  {item.filename}
                </a>

                <Button size="sm" variant="outline" onClick={() => handleDownloadClick(item)} disabled={isDownloading} className="h-8 w-[120px] ... shrink-0">
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1.5" />
                      {t("download")}
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
