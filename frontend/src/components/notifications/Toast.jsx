export default function Toast({ message, type }) {
  const base =
    "px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-3 transition-all";

  const variants = {
    success: "bg-green-600 text-white",
    info: "bg-indigo-600 text-white",
    warning: "bg-yellow-500 text-black",
    error: "bg-red-600 text-white"
  };

  return (
    <div className={`${base} ${variants[type]}`}>
      {message}
    </div>
  );
}
