import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";
// import { QRCodeCanvas } from "qrcode.react"; // No longer needed, we get data URL
import { QrCode, ArrowDown, Globe } from "lucide-react";

export const AppHeader = () => {
  // --- FIX ---
  // localIP is now the full URL (e.g., "http://192.168.1.1:3000")
  // qrCodeDataUrl is the pre-generated QR code
  const { lang, setLang, t, localIP, qrCodeDataUrl } = useAppContext();
  // --- END FIX ---

  const [showQR, setShowQR] = useState(false);

  // --- FIX ---
  // We just use localIP directly.
  const url = localIP;
  // --- END FIX ---

  return (
    <CardHeader className="text-center space-y-2 pb-2">
      {/* --- Language Toggle --- */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs md:text-sm text-slate-500 dark:text-slate-400" onClick={() => setLang(lang === "en" ? "es" : "en")}>
          <Globe className="w-4 h-4 mr-1.5" />
          <span className="hidden md:inline">{lang === "en" ? "Español" : "English"}</span>
        </Button>
      </div>

      {/* --- Title & Description --- */}
      <CardTitle className="text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">Local Link</CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400">{t("description")}</CardDescription>

      {/* --- IP/QR SECTION --- */}
      {url && (
        <div className="pt-2">
          {/* "Enter here" prompt with arrow */}
          <CardDescription className="text-black dark:text-slate-400 text-sm flex items-center justify-center">
            {t("connectPrompt")}
            <ArrowDown className="w-4 h-4 ml-1 shrink-0" />
          </CardDescription>

          {/* URL Link and "Show QR" Button */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-indigo-600 dark:text-indigo-400 truncate hover:underline">
              {url}
            </a>
            <Button variant="outline" size="sm" className="h-8 px-2 text-slate-600 dark:text-slate-300" onClick={() => setShowQR(!showQR)}>
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? t("hideQR") : t("showQR")}
            </Button>
          </div>

          {/* --- FIX: Use qrCodeDataUrl from context --- */}
          {showQR && qrCodeDataUrl && (
            <div className="flex items-center justify-center pt-4">
              <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg w-[128px] h-[128px]" />
            </div>
          )}
          {/* --- END FIX --- */}
        </div>
      )}
    </CardHeader> // <-- FIX: Corrected typo (was CardHeaer)
  );
};
