import React from 'react';

/**
 * PiColorPaletteDuoStroke icon from the duo-stroke style in general category.
 */
interface PiColorPaletteDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiColorPaletteDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'color-palette icon',
  ...props
}: PiColorPaletteDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.485 11.5c.278-5.22 4.777-9.265 9.998-8.986 5.183.276 9.256 4.312 9.037 8.896-.154 2.896-2.657 5.145-5.553 4.99-.935-.05-2.26-.412-3.047.296-.607.545-.716 1.572-.157 2.193.819 1.029.088 2.682-1.291 2.609-5.22-.278-9.265-4.777-8.987-9.998Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.479 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.249 7.263a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.723 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/>
    </svg>
  );
}
