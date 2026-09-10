import React, { useState } from "react";
import { X, Download, FileCode, CheckCircle2, FolderArchive, Layers, Database } from "lucide-react";
import { generateProjectZip, downloadBlob } from "../utils/zipGenerator";

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await generateProjectZip();
      downloadBlob(blob, "airbnb-clone-fullstack.zip");
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 5000);
    } catch (err) {
      console.error("ZIP Generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900">Download Full Project Source (ZIP)</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-neutral-700">
          <div className="bg-rose-50/70 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
            <Layers className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-950 text-xs">Production MVC Full-Stack Repository</p>
              <p className="text-rose-900 leading-relaxed text-[11px]">
                Click below to download the entire codebase structured in strict MVC format with Node.js, Express, TypeScript, Mongoose models, and React Tailwind client.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-600" />
              <span>What is included inside airbnb-clone-fullstack.zip:</span>
            </h3>

            <div className="bg-neutral-900 text-neutral-200 p-3.5 rounded-2xl font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-emerald-400">airbnb-clone-fullstack/</div>
              <div className="pl-3">├── package.json (root orchestration with concurrently)</div>
              <div className="pl-3">├── README.md (quick start & architecture docs)</div>
              <div className="pl-3">├── <span className="text-amber-300">server/</span> (Express + Mongoose + TypeScript)</div>
              <div className="pl-6">├── src/models/ (User, Listing, Booking, Review with conflict logic)</div>
              <div className="pl-6">├── src/controllers/ (Auth, Listing, Booking, Review)</div>
              <div className="pl-6">├── src/routes/ (RESTful endpoints)</div>
              <div className="pl-6">├── src/middleware/ (Auth guards, error handler)</div>
              <div className="pl-6">└── src/server.ts & app.ts</div>
              <div className="pl-3">└── <span className="text-sky-300">client/</span> (React 18 + TypeScript + Tailwind)</div>
              <div className="pl-6">├── src/components/ (Navbar, BookingWidget, ListingCard, Modals)</div>
              <div className="pl-6">├── src/context/ (AuthContext, state stores)</div>
              <div className="pl-6">└── vite.config.ts & tailwind.config.js</div>
            </div>
          </div>

          {downloaded && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Download initiated! Check your downloads folder for airbnb-clone-fullstack.zip.</span>
            </div>
          )}
        </div>

        {/* Footer with Download Action */}
        <div className="p-5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white font-bold rounded-xl text-xs hover:bg-black shadow-md transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? "Packaging ZIP..." : "Download airbnb-clone.zip"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
