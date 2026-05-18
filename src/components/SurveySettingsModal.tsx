import React, { useState } from "react";
import { X, Upload } from "lucide-react";

interface SurveySettingsModalProps {
  surveyTitle: string;
  description: string;
  logo: string | null;
  websiteUrl: string;
  themeColor: string;
  customizeBranding: boolean;
  onSave: (settings: {
    surveyTitle: string;
    description: string;
    logo: string | null;
    websiteUrl: string;
    themeColor: string;
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

export default function SurveySettingsModal({
  surveyTitle,
  description,
  logo,
  websiteUrl,
  themeColor,
  customizeBranding,
  onSave,
  onClose,
}: SurveySettingsModalProps) {
  const [title, setTitle] = useState(surveyTitle);
  const [desc, setDesc] = useState(description);
  const [logoSrc, setLogoSrc] = useState<string | null>(logo);
  const [url, setUrl] = useState(websiteUrl);
  const [color, setColor] = useState(themeColor);
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
      customizeBranding: branding,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Survey Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Branding toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
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
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {/* Logo */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
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
                    className="max-h-16 object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <Upload size={24} />
                    <p className="text-sm font-medium">Upload Logo</p>
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  {logoSrc ? "Click to change" : "PNG, JPG up to 2MB"}
                </span>
              </label>

              {/* Website URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Website URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </div>

              {/* Theme Color */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase">
                  Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                  />
                  <div className="flex gap-1.5">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full border-2 ${color === c ? "border-gray-400" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Survey Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Survey Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this survey about?"
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-400 min-h-20 resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-sm transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
