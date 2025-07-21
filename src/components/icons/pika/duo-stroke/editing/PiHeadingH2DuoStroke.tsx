import React from 'react';

/**
 * PiHeadingH2DuoStroke icon from the duo-stroke style in editing category.
 */
interface PiHeadingH2DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadingH2DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'heading-h2 icon',
  ...props
}: PiHeadingH2DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h8m-8 6V6m8 12V6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.568 18H16v-.82c1.448-1.015 2.932-1.973 4.119-3.302.793-.888.88-2.217.026-3.11-.694-.725-1.894-.962-2.82-.602-.624.243-.98.73-1.325 1.268" fill="none"/>
    </svg>
  );
}
