import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export const SharedTextList = () => {
  const { lang, t, texts, copiedId, handleCopyClick } = useAppContext();

  return (
    <div className="space-y-3">
      <Label className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">{t("sharedText")}</Label>
      {texts.length === 0 ? (
        <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-400">{t("noneText")}</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {texts.map((item) => (
            <li key={item.id} className="relative p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <p className="text-sm text-slate-700 dark:text-slate-200 wrap-break-word pr-12 line-clamp-3">{item.content}</p>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleCopyClick(item.content, item.id)}>
                {copiedId === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
