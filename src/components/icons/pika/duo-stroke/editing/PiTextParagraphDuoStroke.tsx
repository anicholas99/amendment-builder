import React from 'react';

/**
 * PiTextParagraphDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiTextParagraphDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTextParagraphDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'text-paragraph icon',
  ...props
}: PiTextParagraphDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 3v18" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 3H9.03a6.03 6.03 0 0 0 0 12.058H13M13 3v12.058M13 3h8m-8 18v-5.942" fill="none"/>
    </svg>
  );
}
