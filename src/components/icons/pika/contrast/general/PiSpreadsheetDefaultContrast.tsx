import React from 'react';

/**
 * PiSpreadsheetDefaultContrast icon from the contrast style in general category.
 */
interface PiSpreadsheetDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpreadsheetDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'spreadsheet-default icon',
  ...props
}: PiSpreadsheetDefaultContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill="currentColor" d="M3 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9v6m0-6c-.002-1.977-.027-3.013-.436-3.816a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3.026 5.987 3.002 7.024 3 9m18 0h-6m6 6c-.002 1.977-.027 3.013-.436 3.816a4 4 0 0 1-1.748 1.748c-.803.41-1.84.434-3.816.436m6-6h-6m0 0V9m0 6H9m6 0v6m0-12H9m0 0v6m0-6H3m6 6v6m0-6H3m6 6h6m-6 0c-1.977-.002-3.013-.027-3.816-.436a4 4 0 0 1-1.748-1.748c-.41-.803-.434-1.84-.436-3.816m0 0V9" fill="none"/>
    </svg>
  );
}
