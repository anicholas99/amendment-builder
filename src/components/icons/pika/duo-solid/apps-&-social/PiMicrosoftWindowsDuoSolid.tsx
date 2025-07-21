import React from 'react';

/**
 * PiMicrosoftWindowsDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiMicrosoftWindowsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMicrosoftWindowsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'microsoft-windows icon',
  ...props
}: PiMicrosoftWindowsDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M18.669 3.019A3 3 0 0 1 22 6v11.531a3 3 0 0 1-3.331 2.982l-14-1.556A3 3 0 0 1 2 15.976v-8.42a3 3 0 0 1 2.669-2.982z" opacity=".28"/><path fill={color || "currentColor"} d="M2 12.766v-2h8V3.982l1.993-.222q.007.057.007.117v6.889h10v2H12v6.889q0 .059-.007.116L10 19.55v-6.784z"/>
    </svg>
  );
}
