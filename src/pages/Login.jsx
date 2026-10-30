
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FileText, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("Login successful:", result.user.email);

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Firebase login error:", err.code, err.message);

      switch (err.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          setError("Account not found. Please sign up.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Check your internet connection.");
          break;

        default:
          setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-8">

        {/* Logo */}
        <Link
          to="/"
          className="mb-8 flex items-center gap-2 text-2xl font-extrabold"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-black">
            <FileText size={22} />
          </span>

          pdf<span className="text-orange-500">G</span>
        </Link>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Log in to continue using pdfG.
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-7 space-y-4">

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-[#080808] px-4 py-3 outline-none transition focus:border-orange-500"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-[#080808] px-4 py-3 pr-12 outline-none transition focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 transition hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-orange-500 transition hover:text-orange-400"
          >
            Sign up
          </Link>
        </p>

        {/* Back to Home */}
        <Link
          to="/"
          className="mt-5 block text-center text-sm text-gray-500 transition hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
