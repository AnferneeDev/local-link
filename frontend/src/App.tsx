import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// --- 1. We'll use this new state to store the file ---
import { Label } from "@/components/ui/label"; // <-- Import Label for our file input

function App() {
  // --- 2. Change state to hold a File object, not a string ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("Upload a file to get started.");

  // --- 3. Create a function to handle the file selection ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setStatusMessage(event.target.files[0].name);
    }
  };

  // --- 4. Create the function to upload the file ---
  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage("Please select a file first.");
      return;
    }

    // FormData is the standard way to send files in an HTTP request
    const formData = new FormData();
    formData.append("file", selectedFile); // 'file' must match the name in file.controller.ts

    setStatusMessage("Uploading...");

    try {
      // Send the file to the NestJS backend
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      setStatusMessage(`File uploaded! (Name: ${result.filename})`);
      setSelectedFile(null); // Clear the file input
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatusMessage("Upload failed. Check the console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      {/* --- 5. Update the Card UI --- */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Local Link</CardTitle>
          <CardDescription className="text-center">Share files directly from your computer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            {/* We use a normal input with type "file" */}
            <Input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">{statusMessage}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
