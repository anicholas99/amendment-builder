import React from 'react';

/**
 * PiFile02SettingsContrast icon from the contrast style in files-&-folders category.
 */
interface PiFile02SettingsContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02SettingsContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-settings icon',
  ...props
}: PiFile02SettingsContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M19.447 11.371H20V10a8 8 0 0 0-8-8H8a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h4.305v-.285a3 3 0 0 1-.133-.855l-.005-.444-.31-.317a3 3 0 0 1 0-4.198l.31-.317.005-.444a3 3 0 0 1 2.968-2.968l.444-.005.317-.31a3 3 0 0 1 3.546-.486Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.344 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h3m0 0h1a8 8 0 0 1 8 8v.5h-.041A3 3 0 0 0 17 8h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3Zm7 16h.01M18 14l1.179 1.155 1.65.017.017 1.65L22 18l-1.154 1.179-.018 1.65-1.65.017L18 22l-1.179-1.154-1.65-.018-.016-1.65L14 18l1.155-1.179.017-1.65 1.65-.016z" fill="none"/>
    </svg>
  );
}
