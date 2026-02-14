import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";
import logo from "./assets/logo2.png";

const PAGES = {
  CHAT: "chat",
  ADMIN: "admin",
};

function ModeToggle({ mode, onClick, label }) {
  const cls =
    mode === PAGES.ADMIN ? "modeBtn modeBtn--admin" : "modeBtn modeBtn--chat";

  return (
    <button type="button" className={cls} onClick={onClick}>
      {label}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState(PAGES.CHAT);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src={logo} alt="Nodex logo" className="brandLogo" />
          <span className="brandText">Nodex – Knowledge Assistant</span>
        </div>
      </header>

      <main className="main">
        {page === PAGES.CHAT ? (
          <>
            <ChatPage />
            <div className="modeDock">
              <ModeToggle
                mode={PAGES.CHAT}
                onClick={() => setPage(PAGES.ADMIN)}
                label="Admin"
              />
            </div>
          </>
        ) : (
          <>
            <AdminPage />
            <div className="modeDock">
              <ModeToggle
                mode={PAGES.ADMIN}
                onClick={() => setPage(PAGES.CHAT)}
                label="Back to Chat"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
