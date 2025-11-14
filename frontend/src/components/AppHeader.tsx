import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../context/AppContext";

export const AppHeader = () => {
  const { lang, setLang, t, localIP } = useAppContext();
  return (
    <CardHeader className="text-center space-y-2 pb-2">
      <div className="absolute top-4 right-4 flex space-x-1 z-10">
        <Button variant={lang === "en" ? "default" : "ghost"} size="sm" className="h-7 w-10 text-xs" onClick={() => setLang("en")}>
          EN
        </Button>
        <Button variant={lang === "es" ? "default" : "ghost"} size="sm" className="h-7 w-10 text-xs" onClick={() => setLang("es")}>
          ES
        </Button>
      </div>
      <CardTitle className="text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">Local Link</CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400">
        {t("description")}
        {localIP && <span className="block text-sm text-indigo-500 font-medium mt-1">{`http://${localIP}:3000`}</span>}
      </CardDescription>
    </CardHeader>
  );
};
