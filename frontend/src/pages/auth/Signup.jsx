import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import socket from "../../socket/socket";

// Form Input Icons
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="m22 7-10 7L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="18"></line>
    <line x1="15" y1="22" x2="15" y2="18"></line>
    <line x1="8" y1="8" x2="16" y2="8"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="16" x2="12" y2="16"></line>
  </svg>
);

// Background Icons
const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="14" x2="23" y2="14"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="14" x2="4" y2="14"></line>
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const ServerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="8" rx="2" ry="2"></rect>
    <rect x="2" y="13" width="20" height="8" rx="2" ry="2"></rect>
    <line x1="6" y1="7" x2="6" y2="7"></line>
    <line x1="6" y1="17" x2="6" y2="17"></line>
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M16.2 7.8a6 6 0 0 1 0 8.4"></path>
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4"></path>
    <circle cx="18" cy="6" r="2"></circle>
    <circle cx="6" cy="6" r="2"></circle>
    <circle cx="18" cy="18" r="2"></circle>
    <circle cx="6" cy="18" r="2"></circle>
  </svg>
);

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const AllIcons = [
  CpuIcon, DatabaseIcon, CodeIcon, ServerIcon, NetworkIcon, TerminalIcon, ShieldIcon, GearIcon
];

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    batch: "",
    department: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      const { token, role, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", user.id);

      socket.connect();
      socket.emit("join", user.id);

      if (role === "STUDENT") {
        navigate("/student");
      } else {
        navigate("/staff");
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FFF8F0] overflow-hidden py-8">
      
      {/* Animated Background - Unchanged */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8C5A3C]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#4B2E2B]/5 rounded-full blur-3xl animate-pulse-slow" />
        
        {[...Array(50)].map((_, i) => {
          const IconComponent = AllIcons[i % AllIcons.length];
          const size = 12 + Math.random() * 28;
          return (
            <div
              key={`icon-${i}`}
              className="absolute animate-float-gentle text-[#C08552]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${12 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 6}s`,
                opacity: 0.08 + Math.random() * 0.15,
              }}
            >
              <div style={{ width: size, height: size }}>
                <IconComponent />
              </div>
            </div>
          );
        })}

        {[...Array(60)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute animate-pulse-subtle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div
              className={`bg-[${["#C08552", "#8C5A3C", "#4B2E2B"][Math.floor(Math.random() * 3)]}]/${15 + Math.floor(Math.random() * 20)} rounded-full`}
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Signup Card - Reduced padding */}
      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-[#C08552]/20 animate-slide-up">
        
        {/* Logo - Smaller */}
        <div className="flex justify-center mb-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C08552] to-[#8C5A3C] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#C08552] to-[#4B2E2B] rounded-lg flex items-center justify-center shadow-md transform transition-transform group-hover:scale-105 duration-300">
              
               <img 
  src="/logo.png" 
  alt="Logo"
  className="w-full h-full object-cover"
/><svg width="24" height="24" viewBox="0 0 100 100" className="relative">
                <path d="M25 25 L25 75 L75 75" stroke="#FFF8F0" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M55 35 L75 50 L55 65" stroke="#C08552" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Header - Smaller margins */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-[#4B2E2B] mb-1 tracking-tight">
            Create account
          </h1>
          <p className="text-xs text-[#8C5A3C]">
            Get started with Levgress
          </p>
        </div>

        {/* Error Alert - Smaller */}
        {error && (
          <div className="mb-4 p-2 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-xs animate-shake">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Form - Tighter spacing */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Full name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            icon={<UserIcon />}
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            icon={<MailIcon />}
          />

          <div>
            <label className="block text-xs font-semibold text-[#4B2E2B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C5A3C]">
                <LockIcon />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                required
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full rounded-lg border border-[#C08552]/30 bg-white/50 px-3 py-2 text-sm text-[#4B2E2B] placeholder:text-[#8C5A3C]/50 outline-none transition-all focus:border-[#C08552] focus:ring-2 focus:ring-[#C08552]/20 focus:bg-white pl-8 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C5A3C] hover:text-[#C08552] transition-colors"
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#4B2E2B] mb-1.5">
              Account type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "STUDENT" })}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 ${
                  form.role === "STUDENT"
                    ? "border-[#C08552] bg-[#C08552]/10 shadow-sm"
                    : "border-[#C08552]/30 bg-white/50 hover:border-[#C08552]/60"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <svg className={`w-4 h-4 ${form.role === "STUDENT" ? "text-[#C08552]" : "text-[#8C5A3C]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10v6M2 10l10-5 10-5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                  <span className={`text-xs font-medium ${form.role === "STUDENT" ? "text-[#C08552]" : "text-[#4B2E2B]"}`}>
                    Student
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "STAFF" })}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 ${
                  form.role === "STAFF"
                    ? "border-[#C08552] bg-[#C08552]/10 shadow-sm"
                    : "border-[#C08552]/30 bg-white/50 hover:border-[#C08552]/60"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <svg className={`w-4 h-4 ${form.role === "STAFF" ? "text-[#C08552]" : "text-[#8C5A3C]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span className={`text-xs font-medium ${form.role === "STAFF" ? "text-[#C08552]" : "text-[#4B2E2B]"}`}>
                    Staff
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Student-specific fields */}
          {form.role === "STUDENT" && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Batch"
                  name="batch"
                  type="text"
                  value={form.batch}
                  onChange={handleChange}
                  placeholder="2024"
                  icon={<CalendarIcon />}
                />
                <Input
                  label="Department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="CS"
                  icon={<BuildingIcon />}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-2 rounded-lg bg-gradient-to-r from-[#C08552] to-[#8C5A3C] hover:from-[#8C5A3C] hover:to-[#4B2E2B] text-white font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-md overflow-hidden group mt-2"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </form>

        {/* Sign In Link - Tighter */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#8C5A3C]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#C08552] hover:text-[#4B2E2B] transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer - Tighter */}
        <div className="mt-4 pt-3 border-t border-[#C08552]/10">
          <p className="text-[10px] text-[#8C5A3C]/50 text-center">
            © {new Date().getFullYear()} Levgress. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(25px, -25px); }
          66% { transform: translate(-15px, 15px); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.08; }
          50% { transform: translate(12px, -12px) rotate(8deg); opacity: 0.2; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.08); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.4); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.25s ease-in-out;
        }
        
        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 14s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 7s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3.5s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Reusable Input Component with SVG icon - Smaller
function Input({ label, name, type = "text", value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4B2E2B] mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C5A3C]">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          required={name !== "batch" && name !== "department"}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-[#C08552]/30 bg-white/50 px-3 py-1.5 text-sm text-[#4B2E2B] placeholder:text-[#8C5A3C]/50 outline-none transition-all focus:border-[#C08552] focus:ring-2 focus:ring-[#C08552]/20 focus:bg-white ${icon ? 'pl-8' : ''}`}
        />
      </div>
    </div>
  );
}