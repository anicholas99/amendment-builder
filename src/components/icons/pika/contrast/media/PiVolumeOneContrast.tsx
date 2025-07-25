import React from 'react';

/**
 * PiVolumeOneContrast icon from the contrast style in media category.
 */
interface PiVolumeOneContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVolumeOneContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'volume-one icon',
  ...props
}: PiVolumeOneContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M14 18.913V5.088c0-1.711-1.934-2.706-3.326-1.712L7.86 5.386a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 2 11.04v1.918a4.93 4.93 0 0 0 3.963 4.834 4.9 4.9 0 0 1 1.898.822l2.813 2.01c1.392.994 3.326-.001 3.326-1.712Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14a2.9 2.9 0 0 0 .74-.917c.172-.344.26-.711.26-1.083 0-.371-.088-.74-.26-1.082A2.9 2.9 0 0 0 18 10m-4-4.912v13.825c0 1.71-1.934 2.706-3.326 1.711L7.86 18.615a4.9 4.9 0 0 0-1.898-.822A4.93 4.93 0 0 1 2 12.959v-1.918a4.93 4.93 0 0 1 3.963-4.833 4.9 4.9 0 0 0 1.898-.823l2.813-2.009c1.392-.994 3.326 0 3.326 1.712Z" fill="none"/>
    </svg>
  );
}
