import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
