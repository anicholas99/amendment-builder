import React from 'react';

/**
 * PiWineGlassFilledDuoStroke icon from the duo-stroke style in food category.
 */
interface PiWineGlassFilledDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWineGlassFilledDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'wine-glass-filled icon',
  ...props
}: PiWineGlassFilledDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13v9m0 0h4m-4 0H8m9.979-14.562a7 7 0 0 0 .021-.55A10 10 0 0 0 16.698 2H7.302A10 10 0 0 0 6 6.889c0 .554.065 1.091.189 1.602" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13c3.403 0 5.733-2.444 5.979-5.562C15.943 8.31 14.192 8.966 12 8c-2.12-.934-3.834-.357-5.811.49C6.821 11.09 8.991 13 12 13Z" fill="none"/>
    </svg>
  );
}
