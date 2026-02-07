import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LayoutShell } from "./components/layout-shell";
import { Toaster } from "./components/ui/toaster";
import { HomePage } from "./pages/HomePage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <LayoutShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateProjectPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Routes>
      </LayoutShell>
    </BrowserRouter>
  );
}

export default App;
