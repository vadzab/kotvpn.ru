import React from 'react';
import './Detail.css'

interface DetailsProps {
  title?: string;
  children: React.ReactNode;
}

export const Details: React.FC<DetailsProps> = ({ title = "Untitled", children }) => {
  return (
    <div className="macos-window">
      <div className="macos-window-header">
        <div className="macos-window-buttons">
          <span className="close"></span>
          <span className="minimize"></span>
          <span className="maximize"></span>
        </div>
        <span className="macos-window-title">{title}</span>
      </div>
      <div className="macos-window-content">
        {children}
      </div>
    </div>
  );
};
