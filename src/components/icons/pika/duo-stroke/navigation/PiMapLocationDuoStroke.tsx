import React from 'react';

/**
 * PiMapLocationDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiMapLocationDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapLocationDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'map-location icon',
  ...props
}: PiMapLocationDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.452 5.288a2 2 0 0 1 1.206.83C21 6.623 21 7.457 21 9.124v5.897c0 .718 0 1.077-.11 1.394a2 2 0 0 1-.461.747c-.235.24-.556.4-1.198.721l-2.8 1.4c-.525.263-.787.394-1.062.446a2 2 0 0 1-.738 0c-.275-.052-.537-.183-1.062-.445l-3.153-1.577c-.51-.255-.765-.382-1.032-.435a2 2 0 0 0-.768 0c-.267.053-.522.18-1.032.435-1.491.746-2.237 1.118-2.843 1.04a2 2 0 0 1-1.399-.865C3 17.376 3 16.543 3 14.875V8.978c0-.718 0-1.077.11-1.394a2 2 0 0 1 .461-.747c.178-.182.405-.318.785-.513" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7h.01m4.2.444C16.21 10.778 13.052 13 12 13s-4.21-2.222-4.21-5.556S10.42 3 12 3c1.579 0 4.21 1.111 4.21 4.444Z" fill="none"/>
    </svg>
  );
}
