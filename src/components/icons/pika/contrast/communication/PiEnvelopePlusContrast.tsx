import React from 'react';

/**
 * PiEnvelopePlusContrast icon from the contrast style in communication category.
 */
interface PiEnvelopePlusContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopePlusContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-plus icon',
  ...props
}: PiEnvelopePlusContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M14 4h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73C2 7.8 2 9.2 2 12s0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 20 7.2 20 10 20h3a3 3 0 0 1 3-3 3 3 0 0 1 5.197-2.043h.758C22 14.179 22 13.223 22 12c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 4 16.8 4 14 4Z" fill="none" stroke="currentColor"/><path d="M21.847 16h-.018l.012.035z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 20h3m0 0h3m-3 0v-3m0 3v3m-6.996-3H10c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12c0-1.994 0-3.278.197-4.238m19.606 0-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762m19.606 0C22 8.722 22 10.006 22 12c0 .916 0 1.682-.02 2.336m-.177-6.574a4 4 0 0 0-.348-1.032 5 5 0 0 0-2.185-2.185C18.2 4 16.8 4 14 4h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73a4 4 0 0 0-.348 1.032" fill="none"/>
    </svg>
  );
}
