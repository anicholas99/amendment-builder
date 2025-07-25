import React from 'react';

/**
 * PiBriefcaseJobContrast icon from the contrast style in general category.
 */
interface PiBriefcaseJobContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBriefcaseJobContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'briefcase-job icon',
  ...props
}: PiBriefcaseJobContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21 14c0-.85 0-1.506-.023-2.04-.028-.634-.089-1.096-.222-1.505a5 5 0 0 0-3.21-3.21c-.418-.136-.89-.196-1.545-.223C15.474 7 14.83 7 14 7h-4c-.83 0-1.474 0-2 .022-.655.027-1.127.087-1.545.223a5 5 0 0 0-3.21 3.21c-.133.41-.194.87-.222 1.506C3 12.494 3 13.15 3 14c0 1.861 0 2.792.245 3.545a5 5 0 0 0 3.21 3.21C7.208 21 8.139 21 10 21h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 16.792 21 15.861 21 14Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.023 11.96A4.5 4.5 0 0 0 7.5 16H12m-8.977-4.04C3 12.495 3 13.15 3 14c0 1.861 0 2.792.245 3.545a5 5 0 0 0 3.21 3.21C7.208 21 8.139 21 10 21h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 16.792 21 15.861 21 14c0-.85 0-1.506-.023-2.04m-17.954 0c.028-.634.089-1.096.222-1.505a5 5 0 0 1 3.21-3.21c.418-.136.89-.196 1.545-.223m12.977 4.939A4.5 4.5 0 0 1 16.5 16H12m8.977-4.04c-.028-.634-.089-1.096-.222-1.505a5 5 0 0 0-3.21-3.21c-.418-.136-.89-.196-1.545-.223m0 0V7c0-.93 0-1.395-.102-1.776a3 3 0 0 0-2.121-2.122C13.395 3 12.93 3 12 3s-1.395 0-1.777.102a3 3 0 0 0-2.12 2.122C8 5.605 8 6.07 8 7v.022m8 0C15.474 7 14.83 7 14 7h-4c-.83 0-1.474 0-2 .022M12 16v-1m0 1v1" fill="none"/>
    </svg>
  );
}
