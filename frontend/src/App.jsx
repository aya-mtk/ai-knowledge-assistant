import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

const PAGES = {
  CHAT: "chat",
  ADMIN: "admin",
};

export default function App() {
  const [page, setPage] = useState(PAGES.CHAT);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">AI Knowledge Assistant</div>

        <nav className="nav">
          <button
            className={page === PAGES.CHAT ? "tab active" : "tab"}
            onClick={() => setPage(PAGES.CHAT)}
            type="button"
          >
            Chat
          </button>
          <button
            className={page === PAGES.ADMIN ? "tab active" : "tab"}
            onClick={() => setPage(PAGES.ADMIN)}
            type="button"
          >
            Admin
          </button>
        </nav>
      </header>

      <main className="main">
        {page === PAGES.CHAT ? <ChatPage /> : <AdminPage />}
      </main>
    </div>
  );
}
