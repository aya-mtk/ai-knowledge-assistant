import logo from "../assets/logo2.png"; // or whatever your real logo file is

export default function NodexHeader({ active = "Dashboard", onNavigate }) {
  const links = ["Dashboard", "Knowledge Base", "API"];

  return (
    <header className="nodex-header">
      <div className="nodex-header-bg" />

      <div className="nodex-header-inner">
        {/* Logo + Brand */}
        <div className="nodex-brand">
          <div className="nodex-logo-wrapper">
            <img src={logo} alt="Nodex Logo" className="nodex-logo" />
          </div>

          <div className="nodex-brand-text">
            <div className="nodex-brand-title">Nodex</div>
            <div className="nodex-brand-subtitle">AI Knowledge Engine</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="nodex-nav">
          <div className="nodex-nav-links">
            {links.map((label) => {
              const isActive = label === active;
              return (
                <button
                  key={label}
                  type="button"
                  className={isActive ? "nodex-link active" : "nodex-link"}
                  onClick={() => onNavigate?.(label)}
                >
                  {label}
                  {isActive ? <span className="nodex-underline" /> : null}
                </button>
              );
            })}
          </div>

          <button type="button" className="nodex-profile">
            <span className="nodex-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21a8 8 0 10-16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 13a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
