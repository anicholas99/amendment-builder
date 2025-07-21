import React from 'react';

/**
 * PiCampFireDuoStroke icon from the duo-stroke style in general category.
 */
interface PiCampFireDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCampFireDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'camp-fire icon',
  ...props
}: PiCampFireDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 21 12 5.167m0 0L14 2m-2 3.167L22 21M12 5.167 10 2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.616 14.191C12.34 15.486 11.593 17 11 17c0 0-.676-.686-1.145-1.352-.486.674-.855 1.5-.855 2.385 0 1.483 1 2.966 3 2.966s3-1.483 3-2.966c0-1.75-1.443-3.271-2.384-3.84Z" fill="none"/>
    </svg>
  );
}
