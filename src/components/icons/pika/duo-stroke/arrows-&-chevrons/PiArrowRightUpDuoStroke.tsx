import React from 'react';

/**
 * PiArrowRightUpDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowRightUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowRightUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-right-up icon',
  ...props
}: PiArrowRightUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.137 5.863 5.409 18.591" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.257 14.228c.387-2.587.438-5.208.152-7.797a.95.95 0 0 0-.84-.84 30.2 30.2 0 0 0-7.798.152" fill="none"/>
    </svg>
  );
}
