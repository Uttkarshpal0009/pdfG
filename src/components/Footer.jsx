
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <strong>pdfG</strong>
        <p>Your PDFs. Simplified.</p>
      </div>

      <div className="footer-credits">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/uttkarsh-pal-web-developer/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Uttkarsh Pal
          </a>
        </p>

        <div className="footer-links">
          <a
            href="mailto:uttkarshpal0009@gmail.com"
          >
            Email
          </a>

          <a
            href="https://github.com/Uttkarshpal0009"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://uttkarsh-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portfolio
          </a>

          <a
            href="https://www.linkedin.com/in/uttkarsh-pal-web-developer/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <p className="copyright">
        © {new Date().getFullYear()} pdfG. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
