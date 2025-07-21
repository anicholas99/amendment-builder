import React from 'react';

/**
 * PiSunriseDownDuoSolid icon from the duo-solid style in weather category.
 */
interface PiSunriseDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSunriseDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'sunrise-down icon',
  ...props
}: PiSunriseDownDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M3 16a1 1 0 1 1 0 2H2a1 1 0 0 1 0-2z"/><path fill={color || "currentColor"} d="M22 16a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2z"/><path fill={color || "currentColor"} d="M3.72 9.765a1 1 0 0 1 1.41-.096l.754.658.073.071a1 1 0 0 1-1.31 1.498l-.08-.063-.753-.658-.073-.07a1 1 0 0 1-.021-1.34Z"/><path fill={color || "currentColor"} d="M18.876 9.669a1 1 0 0 1 1.316 1.506l-.753.658a1 1 0 0 1-1.316-1.506z"/></g><path fill={color || "currentColor"} d="M12 12a6 6 0 0 1 5.658 7.997l3.343.003.102.005a1 1 0 0 1-.001 1.99l-.103.005-18-.016-.103-.005a1 1 0 0 1 .105-1.995l3.337.002A6 6 0 0 1 12 12Z"/><path fill={color || "currentColor"} d="M12.132 9.994c.262-.022.52-.11.748-.264l.111-.082.313-.26a13 13 0 0 0 1.69-1.756l.25-.321.057-.085a1 1 0 0 0-1.592-1.195l-.065.08-.212.273a11 11 0 0 1-.432.508V3a1 1 0 0 0-2 0v3.89q-.34-.375-.644-.78l-.065-.079a1 1 0 0 0-1.534 1.28l.25.32a13.2 13.2 0 0 0 2.003 2.017l.11.082c.265.18.573.27.88.27z"/>
    </svg>
  );
}
