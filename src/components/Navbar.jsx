import { FileText, Menu } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <a href="/" className="brand">
        <div className="brand-icon">
          <FileText size={23} />
        </div>

        <span>pdfG</span>
      </a>

      <nav className="nav-links">
        <a href="#tools">All tools</a>
        <a href="#about">About</a>
      </nav>

      <button className="get-started">
        Get started
      </button>

      <button className="mobile-menu" aria-label="Open menu">
        <Menu size={23} />
      </button>
    </header>
  );
}

export default Navbar;