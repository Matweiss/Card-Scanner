import React from 'react';

export const PdfIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 9h4.5m-4.5 2.25h4.5m-4.5 2.25h4.5M3 17.25V5.625A2.625 2.625 0 015.625 3h12.75c1.449 0 2.625 1.176 2.625 2.625v10.5c0 1.449-1.176 2.625-2.625 2.625H5.625A2.625 2.625 0 013 17.25z"
    />
  </svg>
);
