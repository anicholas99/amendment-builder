import React from 'react';

/**
 * PiSafeDuoStroke icon from the duo-stroke style in money-&-payments category.
 */
interface PiSafeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSafeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'safe icon',
  ...props
}: PiSafeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-1M5 21v-1M6.8 4h10.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C22 6.28 22 7.12 22 8.8v6.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 20 18.88 20 17.2 20H6.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C2 17.72 2 16.88 2 15.2V8.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C4.28 4 5.12 4 6.8 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14v-3M5.758 16.243l1.414-1.415m5.657-5.656 1.414-1.415m0 8.486-1.414-1.415M7.172 9.172 5.758 7.757M14 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
