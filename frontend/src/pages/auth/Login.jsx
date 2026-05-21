import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import socket from "../../socket/socket";

// Engineering & Computer Science Icon Components
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

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a4 4 0 0 1 3.5 6.1A4 4 0 0 1 16 14a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 .5-1.9A4 4 0 0 1 12 4z"></path>
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const HardDriveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    <line x1="6" y1="16" x2="6.01" y2="16"></line>
    <line x1="10" y1="16" x2="10.01" y2="16"></line>
  </svg>
);

const RouterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="14" width="20" height="8" rx="2"></rect>
    <line x1="6" y1="18" x2="6.01" y2="18"></line>
    <line x1="10" y1="18" x2="10.01" y2="18"></line>
    <path d="M14 18h4"></path>
    <path d="M12 6v4"></path>
    <path d="M9 9l3-3 3 3"></path>
  </svg>
);

const KeyboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    <line x1="6" y1="10" x2="6.01" y2="10"></line>
    <line x1="10" y1="10" x2="10.01" y2="10"></line>
    <line x1="14" y1="10" x2="14.01" y2="10"></line>
    <line x1="18" y1="10" x2="18.01" y2="10"></line>
    <line x1="6" y1="14" x2="6.01" y2="14"></line>
    <line x1="10" y1="14" x2="14" y2="14"></line>
    <line x1="18" y1="14" x2="18.01" y2="14"></line>
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const SmartphoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const TabletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const WatchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7"></circle>
    <polyline points="12 9 12 12 13.5 13.5"></polyline>
    <path d="M16.51 17.35l-.35 3.52a2 2 0 0 1-2 1.81H9.84a2 2 0 0 1-2-1.81l-.35-3.52"></path>
    <path d="M7.49 6.65l.35-3.52a2 2 0 0 1 2-1.81h4.32a2 2 0 0 1 2 1.81l.35 3.52"></path>
  </svg>
);

const BluetoothIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline>
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
    <line x1="22" y1="12" x2="20" y2="12"></line>
    <line x1="6" y1="12" x2="10" y2="12"></line>
  </svg>
);

const UsbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="2"></circle>
    <circle cx="18" cy="12" r="2"></circle>
    <circle cx="10" cy="17" r="2"></circle>
    <path d="M10 9v8"></path>
    <path d="M12 7l4 5"></path>
    <path d="M12 17l4-5"></path>
  </svg>
);

const GitBranchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);

const ContainerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="8" y1="13" x2="16" y2="13"></line>
    <line x1="8" y1="17" x2="16" y2="17"></line>
  </svg>
);

const ApiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z"></path>
    <path d="M9 9h6v6H9z"></path>
    <path d="M15 9l4-4"></path>
    <path d="M9 15l-4 4"></path>
  </svg>
);

const RobotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <circle cx="8" cy="16" r="1"></circle>
    <circle cx="16" cy="16" r="1"></circle>
    <line x1="8" y1="11" x2="8" y2="7"></line>
    <line x1="16" y1="11" x2="16" y2="7"></line>
    <rect x="6" y="2" width="4" height="5" rx="1"></rect>
    <rect x="14" y="2" width="4" height="5" rx="1"></rect>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const PrinterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V3h12v6"></path>
    <path d="M6 21h12v-6H6z"></path>
    <path d="M18 9H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"></path>
    <circle cx="18" cy="15" r="1"></circle>
  </svg>
);

const AllIcons = [
  CpuIcon, DatabaseIcon, CodeIcon, ServerIcon, NetworkIcon, TerminalIcon, 
  ShieldIcon, CloudIcon, GearIcon, BrainIcon, WifiIcon, HardDriveIcon, 
  RouterIcon, KeyboardIcon, MonitorIcon, SmartphoneIcon, TabletIcon, WatchIcon, 
  BluetoothIcon, BatteryIcon, UsbIcon, GitBranchIcon, ContainerIcon, ApiIcon, 
  RobotIcon, LockIcon, BellIcon, MessageIcon, CameraIcon, PrinterIcon
];

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, role, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", user.id);

      socket.connect();
      socket.emit("join", user.id);

      if (role === "STUDENT") {
        navigate("/student");
      } else if (role === "STAFF") {
        navigate("/staff");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FFF8F0] overflow-hidden">
      
      {/* Modern Animated Background with Engineering Icons */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C08552]/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8C5A3C]/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[#4B2E2B]/5 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Floating Engineering Icons - Many More */}
        {[...Array(80)].map((_, i) => {
          const IconComponent = AllIcons[i % AllIcons.length];
          const size = 12 + Math.random() * 32;
          return (
            <div
              key={`icon-${i}`}
              className="absolute animate-float-gentle text-[#C08552]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 25}s`,
                animationDelay: `${Math.random() * 8}s`,
                opacity: 0.08 + Math.random() * 0.2,
              }}
            >
              <div style={{ width: size, height: size }}>
                <IconComponent />
              </div>
            </div>
          );
        })}

        {/* Floating Dots */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute animate-pulse-subtle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            <div
              className={`bg-[${["#C08552", "#8C5A3C", "#4B2E2B"][Math.floor(Math.random() * 3)]}]/${10 + Math.floor(Math.random() * 25)} rounded-full`}
              style={{
                width: `${1 + Math.random() * 5}px`,
                height: `${1 + Math.random() * 5}px`,
              }}
            />
          </div>
        ))}

        {/* Binary floating numbers */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`binary-${i}`}
            className="absolute animate-float-gentle text-[#C08552] font-mono text-xs"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.05 + Math.random() * 0.1,
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </div>
        ))}
      </div>

      {/* Modern Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#C08552]/20 animate-slide-up">
        
        {/* Logo - Replace with your image */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C08552] to-[#8C5A3C] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg transform transition-transform group-hover:scale-105 duration-300">
              {/* Replace the src path with your actual image path */}
              <img 
  src="/logo.png" 
  alt="Logo"
  className="w-full h-full object-cover"
/>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#4B2E2B] mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#8C5A3C] text-sm">
            Sign in to access your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-shake">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#4B2E2B] mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#C08552]/30 bg-white/50 px-4 py-3 text-[#4B2E2B] placeholder:text-[#8C5A3C]/50 outline-none transition-all focus:border-[#C08552] focus:ring-2 focus:ring-[#C08552]/20 focus:bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-[#4B2E2B]">
                Password
              </label>
              <a
                href="#"
                className="text-xs text-[#C08552] hover:text-[#8C5A3C] transition-colors font-medium"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#C08552]/30 bg-white/50 px-4 py-3 text-[#4B2E2B] placeholder:text-[#8C5A3C]/50 outline-none transition-all focus:border-[#C08552] focus:ring-2 focus:ring-[#C08552]/20 focus:bg-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 rounded-xl bg-gradient-to-r from-[#C08552] to-[#8C5A3C] hover:from-[#8C5A3C] hover:to-[#4B2E2B] text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-lg overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8C5A3C]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#C08552] hover:text-[#4B2E2B] transition-colors hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#C08552]/10">
          <p className="text-xs text-[#8C5A3C]/50 text-center">
            © {new Date().getFullYear()} Levgress. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.08; }
          50% { transform: translate(15px, -15px) rotate(10deg); opacity: 0.25; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 15s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}