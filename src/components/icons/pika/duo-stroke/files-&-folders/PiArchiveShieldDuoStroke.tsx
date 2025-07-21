import React from 'react';

/**
 * PiArchiveShieldDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiArchiveShieldDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveShieldDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-shield icon',
  ...props
}: PiArchiveShieldDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.736 11.927 1.875-.677c.23-.083.48-.083.71 0l1.902.687c.386.14.655.492.687.902l.08 1.027a3.83 3.83 0 0 1-1.995 3.66l-.519.28a1.04 1.04 0 0 1-1.014-.01l-.53-.302a3.83 3.83 0 0 1-1.93-3.473l.045-1.152c.016-.425.29-.798.69-.942Z" fill="none"/>
    </svg>
  );
}
