import React from 'react';

/**
 * PiShare01Contrast icon from the contrast style in general category.
 */
interface PiShare01ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShare01Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'share-01 icon',
  ...props
}: PiShare01ContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".23"><path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor"/><path d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor"/><path d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.41 6.51c-2.583.773-4.924 2.033-6.82 3.98m6.82 7c-2.583-.773-4.925-2.033-6.82-3.98M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
