import React from 'react';

/**
 * PiArchiveHeartDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiArchiveHeartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveHeartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-heart icon',
  ...props
}: PiArchiveHeartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.563c.35 0 3.5-1.702 3.5-4.084 0-1.19-1.05-2.026-2.1-2.041-.525-.008-1.05.17-1.4.68-.35-.51-.884-.68-1.4-.68-1.05 0-2.1.85-2.1 2.04 0 2.383 3.15 4.085 3.5 4.085Z" fill="none"/>
    </svg>
  );
}
