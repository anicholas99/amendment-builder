import React from 'react';

/**
 * PiBatteryEmptyDuoSolid icon from the duo-solid style in devices category.
 */
interface PiBatteryEmptyDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBatteryEmptyDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'battery-empty icon',
  ...props
}: PiBatteryEmptyDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20.501 11.005A13 13 0 0 0 20 11a1 1 0 0 1 0-2h.093c.369 0 .731-.001 1.054.085a2.5 2.5 0 0 1 1.768 1.768c.086.323.086.685.085 1.054v.186c0 .369.001.731-.085 1.054a2.5 2.5 0 0 1-1.768 1.768c-.323.086-.685.086-1.054.085H20a1 1 0 0 1 0-2c.242 0 .39 0 .501-.005.107-.005.132-.013.128-.012a.5.5 0 0 0 .354-.354 1 1 0 0 0 .012-.128C21 12.39 21 12.241 21 12c0-.242 0-.39-.005-.501-.005-.107-.013-.132-.012-.128a.5.5 0 0 0-.354-.354 1 1 0 0 0-.128-.012Z" opacity=".28"/><path fill={color || "currentColor"} d="M7.964 5c-.901 0-1.629 0-2.22.04-.61.042-1.148.13-1.657.34A5 5 0 0 0 1.38 8.088c-.212.51-.3 1.048-.34 1.656-.04.591-.04 1.319-.04 2.22v.072c0 .901 0 1.629.04 2.22.042.61.13 1.148.34 1.657a5 5 0 0 0 2.707 2.706c.51.212 1.048.3 1.656.34.592.041 1.32.041 2.221.041h6.072c.901 0 1.629 0 2.22-.04.61-.042 1.148-.13 1.657-.34a5 5 0 0 0 2.706-2.707c.212-.51.3-1.048.34-1.656.041-.592.041-1.32.041-2.221v-.072c0-.901 0-1.629-.04-2.22-.042-.61-.13-1.148-.34-1.657a5 5 0 0 0-2.707-2.706c-.51-.212-1.048-.3-1.656-.34C15.665 5 14.937 5 14.035 5z"/>
    </svg>
  );
}
