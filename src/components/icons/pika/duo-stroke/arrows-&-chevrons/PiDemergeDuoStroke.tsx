import React from 'react';

/**
 * PiDemergeDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiDemergeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDemergeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'demerge icon',
  ...props
}: PiDemergeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.264 4.264 12 12v8m7.736-15.736L15 9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.943 4.286a20.6 20.6 0 0 0-5.296-.2.62.62 0 0 0-.56.56 20.6 20.6 0 0 0 .199 5.297m9.771-5.657a20.6 20.6 0 0 1 5.296-.2.62.62 0 0 1 .56.56 20.6 20.6 0 0 1-.199 5.297" fill="none"/>
    </svg>
  );
}
