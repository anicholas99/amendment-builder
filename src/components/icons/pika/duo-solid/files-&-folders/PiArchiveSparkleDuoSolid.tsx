import React from 'react';

/**
 * PiArchiveSparkleDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiArchiveSparkleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveSparkleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-sparkle icon',
  ...props
}: PiArchiveSparkleDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M4 9a1 1 0 0 0-1 1v7a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-7a1 1 0 0 0-1-1z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12.582c.004.101.005.151.008.195a3 3 0 0 0 2.797 2.797l.195.008-.195.008a3 3 0 0 0-2.797 2.797l-.008.195c-.004-.1-.005-.151-.008-.195A3 3 0 0 0 9 15.582l.195-.008a3 3 0 0 0 2.797-2.797z"/>
    </svg>
  );
}
