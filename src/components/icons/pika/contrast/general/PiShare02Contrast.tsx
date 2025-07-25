import React from 'react';

/**
 * PiShare02Contrast icon from the contrast style in general category.
 */
interface PiShare02ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShare02Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'share-02 icon',
  ...props
}: PiShare02ContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11.409 3.216A20.3 20.3 0 0 0 8 6.856c1.326-.131 2.665-.337 4-.337s2.674.206 4 .337a20.3 20.3 0 0 0-3.409-3.64.92.92 0 0 0-1.182 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v1.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6V13m9-6.481V16m0-9.481c-1.335 0-2.674.206-4 .337a20.3 20.3 0 0 1 3.409-3.64.92.92 0 0 1 1.182 0A20.3 20.3 0 0 1 16 6.856c-1.326-.131-2.665-.337-4-.337Z" fill="none"/>
    </svg>
  );
}
