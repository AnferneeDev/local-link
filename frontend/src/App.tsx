import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("Upload a file to get started.");

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
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Upload successful:", result);
      setStatusMessage(`✅ File uploaded! (Name: ${result.filename})`);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusMessage("❌ Upload failed. Check the console.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-6">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl rounded-3xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">Local Link</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Share files directly from your computer</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="file-upload" className="font-medium text-slate-700 dark:text-slate-300">
              Select a file
            </Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} className="cursor-pointer border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 transition-all duration-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">{statusMessage}</p>
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
