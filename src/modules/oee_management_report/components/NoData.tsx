import React from "react";
import "../styles/NodataScreen.css";

interface NoDataScreenProps {
  message?: string;
  subMessage?: string;
}

const NoDataScreen: React.FC<NoDataScreenProps> = ({
  message = "No Data Available",
  subMessage = "There is no data to display on current Day",
}) => {
  return (
    <div className="no-data-container">
      <div className="no-data-content">
        <div className="no-data-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="64"
            height="64"
          >
            <circle cx="12" cy="12" r="10" fill="#f5f5f5" />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
              fill="#5c6bc0"
            />
            <path d="M13 17h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#5c6bc0" />
          </svg>
        </div>
        <p className="no-data-title">{message}</p>
        <p className="no-data-subtitle">{subMessage}</p>
      </div>
    </div>
  );
};

export default NoDataScreen;
