import React from 'react';

/**
 * PiBottleMilkDuoStroke icon from the duo-stroke style in food category.
 */
interface PiBottleMilkDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBottleMilkDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bottle-milk icon',
  ...props
}: PiBottleMilkDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2h8M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2h8" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 14.497A6.5 6.5 0 0 0 7 15v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5a6.47 6.47 0 0 1-5 0 6.5 6.5 0 0 0-2.5-.503Z" fill="none"/>
    </svg>
  );
}
