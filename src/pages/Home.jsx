import { useEffect, useState } from "react";

import {
  Search,
  Files,
  Scissors,
  Archive,
  FileText,
  Image,
  Shield,
  RotateCw,
  Hash,
  PenTool,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Footer from "../components/Footer";
const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDFs into one document.",
    icon: Files,
    category: "Organize",
    path: "/merge-pdf",
  },
  {
    name: "Split PDF",
    description: "Extract pages from your PDF file.",
    icon: Scissors,
    category: "Organize",
    path: "/split-pdf",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size easily.",
    icon: Archive,
    category: "Optimize",
    path: "/compress-pdf",
  },
  {
    name: "PDF to Word",
    description: "Convert PDF documents to Word.",
    icon: FileText,
    category: "Convert",
    path: "/pdf-to-word",
  },
  {
    name: "Word to PDF",
    description: "Convert Word documents to PDF.",
    icon: FileText,
    category: "Convert",
    path: "/word-to-pdf",
  },
  {
    name: "PDF to JPG",
    description: "Convert PDF pages into images.",
    icon: Image,
    category: "Convert",
    path: "/pdf-to-jpg",
  },
  {
    name: "Protect PDF",
    description: "Add a password to your PDF.",
    icon: Shield,
    category: "Security",
    path: "/protect-pdf",
  },
  {
    name: "Rotate PDF",
    description: "Rotate pages in your document.",
    icon: RotateCw,
    category: "Organize",
    path: "/rotate-pdf",
  },
  {
    name: "Page Numbers",
    description: "Add page numbers to your PDF.",
    icon: Hash,
    category: "Edit",
    path: "/page-numbers",
  },
  {
    name: "Sign PDF",
    description: "Add a signature to your document.",
    icon: PenTool,
    category: "Edit",
    path: "/sign-pdf",
  },
  {
    name: "AI PDF Summary",
    description: "Get a quick summary of your PDF.",
    icon: Sparkles,
    category: "AI Tools",
    path: "/ai-summary",
  },
];

const categories = [
  "All Tools",
  "Organize",
  "Convert",
  "Optimize",
  "Edit",
  "Security",
  "AI Tools",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Tools");
  const [menuOpen, setMenuOpen] = useState(false);

  // Firebase authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for login, signup and logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Filter tools by search and category
  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All Tools" || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  // Scroll to tools section
  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // User authentication buttons
  const AuthButtons = ({ mobile = false }) => {
    if (authLoading) {
      return (
        <span className="text-sm text-gray-400">
          Loading...
        </span>
      );
    }

    if (user) {
      return (
        <div
          className={`flex ${
            mobile
              ? "w-full flex-col items-start gap-3"
              : "items-center gap-3"
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              mobile ? "w-full" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <UserRound size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.displayName || "User"}
              </p>

              <p className="max-w-[220px] truncate text-xs text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-orange-400"
          >
            Logout
          </button>
        </div>
      );
    }

    return (
      <div
        className={`flex ${
          mobile
            ? "w-full flex-col gap-3"
            : "items-center gap-3"
        }`}
      >
        <Link
          to="/login"
          onClick={() => setMenuOpen(false)}
          className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-semibold transition hover:border-orange-500 hover:text-orange-500"
        >
          Log in
        </Link>

        <Link
          to="/signup"
          onClick={() => setMenuOpen(false)}
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-black transition hover:bg-orange-400"
        >
          Sign up
        </Link>
      </div>
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">

      {/* NAVBAR */}
      <nav className="relative z-20 flex min-h-[76px] items-center justify-between border-b border-white/10 bg-[#080808]/95 px-5 sm:px-8 lg:px-[7%]">

        {/* LOGO */}
        <Link to="/" className="flex items-center">
  <img
    src="/logo.png"
    alt="pdfG Logo"
    className="h-12 w-auto object-contain"
  />
</Link>

        {/* NAV LINKS */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-[76px] flex-col gap-1 border-b border-white/10 bg-[#101010] px-5 py-4 md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0`}
        >
          {["All Tools", "Convert", "Edit", "Compress", "AI Tools"].map(
            (item) => (
              <a
                key={item}
                href="#tools"
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm text-gray-400 transition hover:text-orange-500 md:py-0"
              >
                {item}
              </a>
            )
          )}

          {/* MOBILE AUTH BUTTONS */}
          <div className="mt-3 border-t border-white/10 pt-4 sm:hidden">
            <AuthButtons mobile />
          </div>
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden items-center gap-3 sm:flex">
          <AuthButtons />
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* HERO */}
      <section className="relative px-5 pb-20 pt-20 text-center sm:pt-28">

        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-400">
            <Sparkles size={15} />
            Your all-in-one PDF workspace
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            All your PDF tools.
            <br />
            <span className="text-orange-500">
              One beautiful place.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-400 sm:text-lg sm:leading-8">
            Merge, split, compress, and convert your PDF files
            <br className="hidden sm:block" />
            with simple and powerful tools.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-9 flex max-w-2xl items-center gap-3 rounded-xl border border-white/10 bg-[#151515] p-2 pl-4 transition focus-within:border-orange-500">

            <Search
              className="shrink-0 text-gray-500"
              size={21}
            />

            <input
              type="text"
              placeholder="Search PDF tools..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                scrollToTools();
              }}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-600"
            />

            <button
              onClick={scrollToTools}
              className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"
            >
              Search
            </button>
          </div>

          {/* TRUST LABELS */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-400">
            <span>✓ Easy to use</span>
            <span>✓ Secure processing</span>
            <span>✓ No watermarks</span>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section
        className="mx-auto max-w-7xl scroll-mt-10 px-5 pb-24 sm:px-8"
        id="tools"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <span className="mb-3 block text-xs font-bold tracking-[0.2em] text-orange-500">
              EXPLORE OUR TOOLS
            </span>

            <h2 className="text-2xl font-extrabold sm:text-3xl">
              What do you want to do today?
            </h2>
          </div>

          <span className="w-fit rounded-full border border-white/10 bg-[#151515] px-4 py-2 text-xs text-gray-400">
            {filteredTools.length} tools
          </span>
        </div>

        {/* CATEGORIES */}
        <div className="mb-8 flex flex-wrap gap-2.5">
          {categories.map((item) => (
            <button
              key={item}
              className={`rounded-full border px-4 py-2.5 text-xs font-medium transition ${
                category === item
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-white/10 bg-[#141414] text-gray-400 hover:border-orange-500 hover:text-orange-500"
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* TOOL CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                to={tool.path}
                className="group relative flex min-h-[215px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-orange-500/70 hover:bg-[#191919] hover:shadow-[0_12px_35px_rgba(255,121,0,0.08)]"
                key={tool.name}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-black">
                  <Icon size={24} />
                </div>

                <h3 className="mb-2 text-base font-bold text-white">
                  {tool.name}
                </h3>

                <p className="pr-5 text-sm leading-6 text-gray-400">
                  {tool.description}
                </p>

                <span className="absolute bottom-5 right-5 text-gray-600 transition group-hover:translate-x-1 group-hover:text-orange-500">
                  <ArrowRight size={18} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* NO TOOLS FOUND */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
            <Search size={35} className="mb-4 text-orange-500" />

            <h3 className="mb-2 text-lg font-bold">
              No tools found
            </h3>

            <p className="text-sm text-gray-400">
              Try another search or category.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      
{/* FOOTER */}
<footer className="flex flex-col items-center justify-between gap-5 border-t border-white/10 bg-[#080808] px-6 py-8 text-center sm:flex-row sm:px-[7%] sm:text-left">

  {/* Logo and Brand */}
  <Link
    to="/"
    className="flex items-center gap-2.5 text-xl font-extrabold"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-black">
      <FileText size={18} />
    </span>

    <span>
      pdf<span className="text-orange-500">G</span>
    </span>
  </Link>

  {/* Creator Credits and Social Links */}
  <div className="flex flex-col items-center gap-2">
    <p className="text-sm text-gray-400">
      Made with ❤️ by{" "}
      <a
        href="https://www.linkedin.com/in/uttkarsh-pal-web-developer/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-orange-500 transition hover:text-orange-400"
      >
        Uttkarsh Pal
      </a>
    </p>

    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
     
      <a
        href="https://github.com/Uttkarshpal0009"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-orange-500"
      >
        GitHub
      </a>

      <a
        href="https://uttkarsh-portfolio.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-orange-500"
      >
        Portfolio
      </a>

      <a
        href="https://www.linkedin.com/in/uttkarsh-pal-web-developer/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-orange-500"
      >
        LinkedIn
      </a>
    </div>
  </div>

  {/* Copyright */}
  <span className="text-xs text-gray-600">
    © {new Date().getFullYear()} pdfG. All rights reserved.
  </span>

</footer>

    </main>
  );
}