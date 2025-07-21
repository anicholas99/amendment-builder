import React from 'react';

/**
 * PiQuestionMarkDuoStroke icon from the duo-stroke style in alerts category.
 */
interface PiQuestionMarkDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiQuestionMarkDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'question-mark icon',
  ...props
}: PiQuestionMarkDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.728 9.272a4.272 4.272 0 1 1 6.595 3.586C13.185 13.596 12 14.644 12 16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19h.01" fill="none"/>
    </svg>
  );
}
