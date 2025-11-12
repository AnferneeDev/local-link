import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function App() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Electron App</CardTitle>
          <CardDescription className="text-center">Your modern desktop application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Enter something..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">This is a simple Electron app built with Vite, React, TypeScript and Shadcn UI.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => alert("Hello " + (inputValue || "World"))}>
            Say Hello
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
