declare module "@react-pdf-viewer/core" {
  import React from "react";

  export interface ViewerProps {
    fileUrl: string;
    plugins?: any[];
    defaultScale?: number;
    onDocumentLoad?: (e: any) => void;
    onPageChange?: (e: { currentPage: number }) => void;
    theme?: { theme: "auto" | "dark" | "light" };
    renderError?: (error: Error) => React.ReactNode;
  }

  export class Worker extends React.Component {
    props: {
      workerUrl: string;
      children: React.ReactNode;
    };
  }

  export class Viewer extends React.Component<ViewerProps> {}

  export enum SpecialZoomLevel {
    PageFit,
    PageWidth,
    PageActualSize,
  }
}

declare module "@react-pdf-viewer/default-layout" {
  export function defaultLayoutPlugin(): any;
}

declare module "@react-pdf-viewer/zoom" {
  import React from "react";

  export function zoomPlugin(): {
    ZoomIn: React.ComponentType<{
      children: (props: { onClick: () => void }) => React.ReactNode;
    }>;
    ZoomOut: React.ComponentType<{
      children: (props: { onClick: () => void }) => React.ReactNode;
    }>;
    CurrentScale: React.ComponentType<{
      children: (props: { scale: number }) => React.ReactNode;
    }>;
  };
}

declare module "@react-pdf-viewer/search" {
  import React from "react";

  export function searchPlugin(options?: {
    keyword?: string;
    onHighlightKeyword?: (props: any) => void;
  }): {
    Search: React.ComponentType<{ children: (props: any) => React.ReactNode }>;
  };
}

declare module "@react-pdf-viewer/thumbnail" {
  export function thumbnailPlugin(): {
    Thumbnails: React.ComponentType;
  };
}

declare module "@react-pdf-viewer/page-navigation" {
  export function pageNavigationPlugin(): {
    jumpToPage: (pageIndex: number) => void;
  };
}
