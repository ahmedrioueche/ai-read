import { useState } from "react";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

export const useReaderState = () => {
  const [zoomLevel, setZoomLevel] = useState<number | SpecialZoomLevel>(
    SpecialZoomLevel.ActualSize
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState(false);

  return {
    zoomLevel,
    setZoomLevel,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    isControlsVisible,
    setIsControlsVisible,
  };
};
