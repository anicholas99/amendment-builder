import React from 'react';

/**
 * PiUturnRightDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiUturnRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUturnRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'uturn-right icon',
  ...props
}: PiUturnRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8H9a5 5 0 0 0 0 10h3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.969 3.916a20.8 20.8 0 0 1 3.886 3.679.64.64 0 0 1 0 .809 20.8 20.8 0 0 1-3.886 3.679" fill="none"/>
    </svg>
  );
}
