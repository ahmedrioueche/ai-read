import React from "react";
import { ZoomIn, ZoomOut, MessageCircle } from "lucide-react";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

interface ReaderControlsProps {
  isDarkMode: boolean;
  isControlsVisible: boolean;
  setIsControlsVisible: (visible: boolean) => void;
  zoomLevel: number | SpecialZoomLevel;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomChange: (newZoom: number | SpecialZoomLevel) => void;
  currentPage: number;
  handlePageInputSubmit: (e: React.FormEvent) => void;
  handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalPages: number;
}

const ReaderControls: React.FC<ReaderControlsProps> = ({
  isDarkMode,
  isControlsVisible,
  setIsControlsVisible,
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  handleZoomChange,
  currentPage,
  totalPages,
  handlePageInputSubmit,
  handlePageInputChange,
}) => {
  return (
    <div
      className={`fixed ${
        isDarkMode ? "top-4" : "top-16"
      } left-4 z-50 flex items-center space-x-4 ${
        isDarkMode
          ? "bg-black/90 text-white filter invert hue-rotate-180"
          : "bg-white/90 text-black"
      } backdrop-blur-sm p-2 rounded-lg shadow-lg transition-opacity duration-300 ${
        isControlsVisible ? "opacity-100" : "opacity-0"
      } hover:opacity-100`}
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => setIsControlsVisible(false)}
      onClick={() => setIsControlsVisible(!isControlsVisible)}
    >
      <button
        onClick={handleZoomOut}
        className={`p-2 ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600 filter invert hue-rotate-180"
            : "bg-gray-200 hover:bg-gray-300"
        } rounded-full transition-colors`}
      >
        <ZoomOut size={16} />
      </button>
      <select
        value={zoomLevel}
        onChange={(e) =>
          handleZoomChange(
            parseFloat(e.target.value) as unknown as SpecialZoomLevel
          )
        }
        className={`p-2 ${
          isDarkMode
            ? "bg-gray-700 text-white filter invert hue-rotate-180"
            : "bg-gray-200 text-black"
        } rounded-lg`}
      >
        <option value={SpecialZoomLevel.ActualSize}>100%</option>
        <option value={SpecialZoomLevel.PageFit}>Fit Page</option>
        <option value={SpecialZoomLevel.PageWidth}>Fit Width</option>
        <option value={1.5}>150%</option>
        <option value={2}>200%</option>
        <option value={3}>300%</option>
        <option value={4}>400%</option>
      </select>
      <button
        onClick={handleZoomIn}
        className={`p-2 ${
          isDarkMode
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        } rounded-full transition-colors`}
      >
        <ZoomIn size={16} />
      </button>
      <form
        onSubmit={handlePageInputSubmit}
        className="flex items-center space-x-2"
      >
        <input
          type="number"
          onChange={handlePageInputChange}
          value={currentPage}
          min={1}
          max={totalPages}
          className={`w-12 p-2 ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
          } rounded-lg text-center`}
        />
        <span className={isDarkMode ? "text-white" : "text-black"}>
          / {totalPages}
        </span>
      </form>
    </div>
  );
};

export default ReaderControls;
