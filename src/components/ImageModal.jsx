import React from "react";

export default function ImageModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative">
        <img
          src={url}
          className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
