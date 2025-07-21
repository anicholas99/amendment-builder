import React from 'react';

/**
 * PiFile02QuestionMarkDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02QuestionMarkDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02QuestionMarkDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-question-mark icon',
  ...props
}: PiFile02QuestionMarkDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.85 12.002a2.249 2.249 0 0 1 4.37.75c0 1.498-2.25 2.248-2.25 2.248m.03 3h.01M20 10a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.024.713a2 2 0 0 0 1.662 1.662C15.843 8 16.03 8 16.4 8h.6a3 3 0 0 1 3 3z" fill="none"/>
    </svg>
  );
}
