import { useState } from "react";

const API_BASE = "http://localhost:5000/api/auth";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("signup"); // "login" | "signup" | "otp"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // form fields
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState(""); // jis email ka login-OTP verify karna hai
  const [user, setUser] = useState(null); // logged-in user { id, name, email }
  const [showUserMenu, setShowUserMenu] = useState(false);

  const openModal = (tab) => {
    setActiveTab(tab);
    setMessage("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMessage("");
  };

  // ----- SIGNUP (koi OTP nahi, seedha account ban jata hai) -----
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Kuch ghalat ho gaya");
        return;
      }

      setMessage("Signup ho gaya! Ab login karein.");
      setActiveTab("login");
      setLoginData({ email: signupData.email, password: "" });
    } catch (err) {
      setMessage(
        "Server se connect nahi ho saka. Backend chal raha hai check karein.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----- LOGIN STEP 1: email+password check, OTP bheja jata hai -----
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login fail ho gaya");
        return;
      }

      setPendingEmail(loginData.email);
      setActiveTab("otp");
      setMessage(data.message || "OTP aapke email par bhej diya gaya hai ✅");
    } catch (err) {
      setMessage("Server se connect nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  // ----- LOGIN STEP 2: OTP verify karke asal login complete hota hai -----
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Ghalat OTP");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setMessage(`Welcome back, ${data.user.name} 🎉`);
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      setMessage("Server se connect nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowUserMenu(false);
  };

  // ----- RESEND OTP -----
  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      setMessage(data.message || "Naya OTP bhej diya gaya");
    } catch (err) {
      setMessage("Server se connect nahi ho saka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black-950 text-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-end px-8 py-4 bg-gray-900 border-b border-gray-800">
        {/* <div className="text-xl font-bold">
          Brand<span className="text-violet-500">Name</span>
        </div> */}

        {/* <ul className="hidden md:flex gap-6 list-none text-sm text-gray-400">
          <li>
            <a href="#" className="hover:text-gray-100 transition">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-100 transition">
              Features
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-100 transition">
              Pricing
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-100 transition">
              Contact
            </a>
          </li>
        </ul> */}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center transition"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openModal("signup")}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition transform hover:-translate-y-0.5 shadow-lg shadow-violet-600/20"
          >
            Sign Up
          </button>
        )}
      </nav>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-100 text-xl leading-none"
            >
              &times;
            </button>

            {/* Tabs (OTP step ke dauran hide) */}
            {activeTab !== "otp" && (
              <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
                <button
                  onClick={() => {
                    setActiveTab("login");
                    setMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${
                    activeTab === "login"
                      ? "bg-violet-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setActiveTab("signup");
                    setMessage("");
                  }}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${
                    activeTab === "signup"
                      ? "bg-violet-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {message && (
              <p className="text-center text-xs text-violet-300 bg-violet-950/40 border border-violet-800 rounded-lg py-2 px-3 mb-4">
                {message}
              </p>
            )}

            {/* LOGIN FORM */}
            {activeTab === "login" && (
              <form className="flex flex-col gap-3.5" onSubmit={handleLogin}>
                <h2 className="text-xl font-bold mb-0">Welcome back</h2>
                <p className="text-xs text-gray-400 mb-2">
                  Login karein, OTP aapke email par bheja jayega
                </p>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Please wait..." : "Login"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-1">
                  Account nahi hai?{" "}
                  <span
                    onClick={() => setActiveTab("signup")}
                    className="text-violet-400 font-semibold cursor-pointer"
                  >
                    Sign Up karein
                  </span>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === "signup" && (
              <form className="flex flex-col gap-3.5" onSubmit={handleSignup}>
                <h2 className="text-xl font-bold mb-0">Create account</h2>
                <p className="text-xs text-gray-400 mb-2">
                  Naya account banayein, sirf kuch second lagenge
                </p>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Please wait..." : "Sign Up"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-1">
                  Pehle se account hai?{" "}
                  <span
                    onClick={() => setActiveTab("login")}
                    className="text-violet-400 font-semibold cursor-pointer"
                  >
                    Login karein
                  </span>
                </p>
              </form>
            )}

            {/* OTP FORM (login ke waqt) */}
            {activeTab === "otp" && (
              <form
                className="flex flex-col gap-3.5"
                onSubmit={handleVerifyOtp}
              >
                <h2 className="text-xl font-bold mb-0">Verify login</h2>
                <p className="text-xs text-gray-400 mb-2">
                  {pendingEmail} par bheja gaya 6-digit code darj karein
                </p>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none focus:border-violet-500 transition text-center tracking-[6px] font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-1">
                  Code nahi mila?{" "}
                  <span
                    onClick={handleResendOtp}
                    className="text-violet-400 font-semibold cursor-pointer"
                  >
                    Dubara bhejein
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
