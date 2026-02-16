import { useEffect, useState } from "react";
import socket from "../../socket/socket";
import Toast from "./Toast";

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    socket.on("level-up", (data) => {
      addToast(`Level Up! Now Level ${data.level}`, "success");
    });

    socket.on("badge-earned", (data) => {
      addToast(`Badge Earned: ${data.name}`, "info");
    });

    socket.on("stagnation-alert", (data) => {
      addToast(
        `Inactivity Warning: ${data.level}`,
        "warning"
      );
    });

    return () => {
      socket.off("level-up");
      socket.off("badge-earned");
      socket.off("stagnation-alert");
    };
  }, []);

  return (
    <div className="fixed top-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </div>
  );
}
