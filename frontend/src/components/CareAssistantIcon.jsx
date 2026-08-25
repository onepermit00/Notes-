import React from 'react';

/**
 * ADLTrack Care Assistant Icon
 * Green rounded square with white heartbeat/pulse waveform
 */
export const CareAssistantIcon = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Black rounded square - fills entire viewBox */}
      <rect x="0" y="0" width="100" height="100" rx="22" fill="#1c1c1e" />

      {/* Green heartbeat/pulse waveform line */}
      <polyline
        points="10,52 28,52 34,52 38,38 44,66 50,28 56,72 60,44 64,52 68,52 90,52"
        fill="none"
        stroke="#25D366"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CareAssistantIcon;
