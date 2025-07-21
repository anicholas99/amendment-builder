import React from 'react';

/**
 * PiFile02ShieldDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02ShieldDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02ShieldDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-shield icon',
  ...props
}: PiFile02ShieldDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a8 8 0 0 1 8 8v1a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.736 11.74 1.875-.678c.23-.083.48-.083.71 0l1.902.687c.386.14.655.493.687.902l.079 1.027a3.83 3.83 0 0 1-1.994 3.66l-.519.281a1.04 1.04 0 0 1-1.014-.01l-.53-.302a3.83 3.83 0 0 1-1.93-3.474l.045-1.152c.016-.425.289-.797.689-.942Z" fill="none"/>
    </svg>
  );
}
