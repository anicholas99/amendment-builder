import React from 'react';

/**
 * PiCloudWindContrast icon from the contrast style in weather category.
 */
interface PiCloudWindContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudWindContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-wind icon',
  ...props
}: PiCloudWindContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M22 12.5a5.5 5.5 0 0 1-5.5 5.5h-1.915a5 5 0 0 0-.65-1.087 5.002 5.002 0 1 0-3.437-9.242A3 3 0 0 0 9.091 11H3.67v-1a4.5 4.5 0 0 1 2.347-.974 6.5 6.5 0 0 1 12.65-1.582A5.5 5.5 0 0 1 22 12.5Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14h11a2 2 0 1 0-1-3.732M2 18h8a2 2 0 1 1-1 3.732M12.5 3a6.5 6.5 0 0 1 6.168 4.444A5.501 5.501 0 0 1 16.5 18h-.918M12.5 3a6.5 6.5 0 0 0-6.483 6.026A4.5 4.5 0 0 0 3.671 10M12.5 3c-3.738 0-6.764 3.285-6.481 7" fill="none"/>
    </svg>
  );
}
