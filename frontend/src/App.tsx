import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import { Download } from "lucide-react";

// --- 1. DEFINE THE API BASE URL ---
// If we are in "Dev" mode (Electron window), use localhost:3000
// If we are in "Production" (Phone/Browser served by NestJS), use "" (relative path)
const API_BASE = import.meta.env.DEV ? "http://localhost:3000" : "";

// --- 2. CONNECT USING THE DYNAMIC URL ---
const socket = io(API_BASE);

interface SharedFile {
  id: string;
  filename: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("Upload a file to get started.");
  const [files, setFiles] = useState<SharedFile[]>([]);

  useEffect(() => {
    socket.on("file-added", (newFile: SharedFile) => {
      setFiles((prev) => [...prev, newFile]);
    });

    socket.on("files-cleared", () => {
      setFiles([]);
    });

    return () => {
      socket.off("file-added");
      socket.off("files-cleared");
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setStatusMessage(event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setStatusMessage("Uploading...");

    try {
      // --- 3. USE API_BASE FOR UPLOAD ---
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Upload successful:", result);
      setStatusMessage(`✅ File uploaded!`);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusMessage("❌ Upload failed. Check the console.");
    }
  };

  const downloadFile = (filename: string) => {
    // --- 4. USE API_BASE FOR DOWNLOAD ---
    // On the phone, this becomes "http://192.168.1.5:3000/file/image.png" automatically
    window.open(`${API_BASE}/file/${filename}`, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-6">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl rounded-3xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">Local Link</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Share files directly from your computer</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="file-upload" className="font-medium text-slate-700 dark:text-slate-300">
              Select a file
            </Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} className="cursor-pointer border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 transition-all duration-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">{statusMessage}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Label className="font-medium text-slate-700 dark:text-slate-300 mb-2 block">Available Downloads</Label>

            {files.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-400">No files shared yet</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{file.filename}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(file.filename)} className="h-8 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                      <Download className="w-3 h-3 mr-1.5" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full py-5 rounded-2xl font-semibold text-lg bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
