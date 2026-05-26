import React, { useState } from "react";
import { X, Upload } from "lucide-react";

interface SurveySettingsModalProps {
  surveyTitle: string;
  description: string;
  logo: string | null;
  websiteUrl: string;
  themeColor: string;
  backgroundColor: string;
  customizeBranding: boolean;
  onSave: (settings: {
    surveyTitle: string;
    description: string;
    logo: string | null;
    websiteUrl: string;
    themeColor: string;
    backgroundColor: string;
    customizeBranding: boolean;
  }) => void;
  onClose: () => void;
}

const colorPresets = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
];

const bgColorPresets = [
  "#FFFFFF",
  "#F8FAFC",
  "#F0FDF4",
  "#EFF6FF",
  "#FAF5FF",
  "#FFF7ED",
];

export default function SurveySettingsModal({
  surveyTitle,
  description,
  logo,
  websiteUrl,
  themeColor,
  backgroundColor,
  customizeBranding,
  onSave,
  onClose,
}: SurveySettingsModalProps) {
  const [title, setTitle] = useState(surveyTitle);
  const [desc, setDesc] = useState(description);
  const [logoSrc, setLogoSrc] = useState<string | null>(logo);
  const [url, setUrl] = useState(websiteUrl);
  const [color, setColor] = useState(themeColor);
  const [bgColor, setBgColor] = useState(backgroundColor);
  const [branding, setBranding] = useState(customizeBranding);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      surveyTitle: title.trim() || "Untitled Survey",
      description: desc,
      logo: logoSrc,
      websiteUrl: url,
      themeColor: color,
      backgroundColor: bgColor,
      customizeBranding: branding,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ marginTop: "80px" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header - fixed */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Survey Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Branding toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Customize Branding
            </label>
            <div
              onClick={() => setBranding(!branding)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200 ${branding ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${branding ? "left-6" : "left-1"}`}
              />
            </div>
          </div>

          {branding && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {/* Logo */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {logoSrc && logoSrc.startsWith("data:") ? (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="max-h-10 object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <Upload size={18} />
                    <p className="text-xs font-medium">Upload Logo</p>
                  </div>
                )}
                <span className="text-[10px] text-gray-500">
                  {logoSrc ? "Click to change" : "PNG, JPG up to 2MB"}
                </span>
              </label>

              {/* Website URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase">
                  Website URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Theme Color */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-4 h-4 rounded-full border ${color === c ? "border-gray-600" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-slate-400">Controls header bar, buttons, and accent elements</p>
              </div>

              {/* Background Color */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {bgColorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className={`w-4 h-4 rounded-full border ${bgColor === c ? "border-gray-600" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-slate-400">Controls the survey page background</p>
              </div>
            </div>
          )}

          {/* Survey Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-600 uppercase">
              Survey Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-600 uppercase">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this survey about?"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 min-h-16 resize-y"
            />
          </div>
        </div>

        {/* Footer - fixed */}
        <div className="shrink-0 flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}