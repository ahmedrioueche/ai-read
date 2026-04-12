import React from "react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

interface ReaderViewerProps {
  bookUrl: string;
  lastPage?: number;
  handlePageChange: (e: any) => void;
  setTotalPages: (pages: number) => void;
  viewerRef: React.RefObject<any>;
  zoomLevel: number | SpecialZoomLevel;
  zoomPluginInstance: any;
  pageNavigationPluginInstance: any;
}

const ReaderViewer: React.FC<ReaderViewerProps> = ({
  bookUrl,
  lastPage,
  handlePageChange,
  setTotalPages,
  viewerRef,
  zoomLevel,
  zoomPluginInstance,
  pageNavigationPluginInstance,
}) => {
  return (
    <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
      <Viewer
        fileUrl={bookUrl}
        initialPage={lastPage}
        onPageChange={handlePageChange}
        onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
        ref={viewerRef}
        defaultScale={zoomLevel}
        plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
      />
    </Worker>
  );
};

export default ReaderViewer;
