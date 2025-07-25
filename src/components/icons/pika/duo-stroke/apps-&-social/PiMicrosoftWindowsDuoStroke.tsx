import React from 'react';

/**
 * PiMicrosoftWindowsDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiMicrosoftWindowsDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMicrosoftWindowsDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'microsoft-windows icon',
  ...props
}: PiMicrosoftWindowsDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18.78 4.012-14 1.556A2 2 0 0 0 3 7.556v8.42a2 2 0 0 0 1.78 1.987l14 1.556A2 2 0 0 0 21 17.53V6.001a2 2 0 0 0-2.22-1.989Z" opacity=".28" fill="none"/><path fill="none" d="M2 12.766v-2h8V3.982l1.993-.222q.007.057.007.117v6.889h10v2H12v6.889q0 .059-.007.116L10 19.55v-6.784z"/>
    </svg>
  );
}
