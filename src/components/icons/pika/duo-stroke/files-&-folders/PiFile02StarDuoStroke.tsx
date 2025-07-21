import React from 'react';

/**
 * PiFile02StarDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02StarDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02StarDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-star icon',
  ...props
}: PiFile02StarDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a8 8 0 0 1 8 8v1a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c.004.1.005.151.008.195a3 3 0 0 0 2.797 2.797L15 14c-.1.004-.151.005-.195.008a3 3 0 0 0-2.797 2.797L12 17c-.004-.1-.005-.151-.008-.195a3 3 0 0 0-2.797-2.797L9 14c.1-.004.151-.005.195-.008a3 3 0 0 0 2.797-2.797z" fill="none"/>
    </svg>
  );
}
