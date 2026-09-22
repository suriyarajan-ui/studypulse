import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone, Monitor } from "lucide-react";

interface PWAInstallButtonProps {
  variant?: "header" | "sidebar" | "banner";
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "header",
  className = "",
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running inside installed standalone PWA, suppress the prompt
  if (isInstalled) {
    return null;
  }

  // Handle click action
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      // If not yet captured beforeinstallprompt or on iOS / desktop fallback, open the guided modal
      setShowGuideModal(true);
    }
  };

  const renderButton = () => {
    if (variant === "sidebar") {
      return (
        <button
          id="pwa-install-sidebar-btn"
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100/80 active:bg-indigo-200 border border-indigo-200/80 shadow-2xs transition-all ${className}`}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600 animate-bounce" />
            <span>Install StudyPulse</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-indigo-800 border border-indigo-200">
            App
          </span>
        </button>
      );
    }

    if (variant === "banner") {
      return (
        <div className={`p-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Install StudyPulse App</p>
              <p className="text-[11px] text-indigo-100 truncate">
                Fast offline access, full-screen mode & instant launch
              </p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 active:scale-95 transition-all shrink-0 shadow-xs"
          >
            Install
          </button>
        </div>
      );
    }

    // Default: Header button
    return (
      <button
        id="pwa-install-header-btn"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs transition-all ${className}`}
        title="Install StudyPulse as native web application"
      >
        <Download className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Guided installation instructions modal for iOS or manual desktop instructions */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Install StudyPulse
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Full-screen Progressive Web App
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-950 block mb-0.5">
                      iOS Safari Installation
                    </span>
                    Follow these 2 quick steps to add StudyPulse to your iPhone or iPad home screen:
                  </div>
                </div>

                <ol className="space-y-2.5 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      Tap the <strong className="text-slate-900 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-indigo-600" /> Share</strong> button in Safari's bottom toolbar.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      Scroll down and tap <strong className="text-slate-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-indigo-600" /> Add to Home Screen</strong>.
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <Monitor className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Android / Desktop Installation
                    </span>
                    You can install StudyPulse directly onto your device:
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Chrome / Edge (Desktop):</strong> Click the install icon <Download className="w-3 h-3 inline text-indigo-600" /> in the right side of the address bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Chrome (Android):</strong> Tap the three-dot menu (⋮) and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
