import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AppHeader } from "./components/AppHeader";
import { UploadManager } from "./components/UploadManager";
import { SharedFileList } from "./components/SharedFileList";
import { SharedTextList } from "./components/SharedTextList";

function App() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-linear-to-br from-indigo-100 via-slate-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-4">
      <Card className="relative w-full max-w-md md:max-w-4xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 rounded-3xl">
        <AppHeader />

        <CardContent className="space-y-6">
          <UploadManager />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <SharedFileList />
            <SharedTextList />
          </div>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}

export default App;
