import React from 'react';

/**
 * PiFile02HeartDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02HeartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02HeartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-heart icon',
  ...props
}: PiFile02HeartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a8 8 0 0 1 8 8v1a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.625c.35 0 3.5-1.701 3.5-4.083 0-1.191-1.05-2.027-2.1-2.042-.525-.007-1.05.17-1.4.68-.35-.51-.884-.68-1.4-.68-1.05 0-2.1.85-2.1 2.042 0 2.382 3.15 4.083 3.5 4.083Z" fill="none"/>
    </svg>
  );
}
