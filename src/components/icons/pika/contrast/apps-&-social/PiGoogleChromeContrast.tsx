import React from 'react';

/**
 * PiGoogleChromeContrast icon from the contrast style in apps-&-social category.
 */
interface PiGoogleChromeContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGoogleChromeContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'google-chrome icon',
  ...props
}: PiGoogleChromeContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8.246a3.754 3.754 0 1 1 0 7.508 3.754 3.754 0 0 1 0-7.508Zm0 0h8.347M8.753 13.877 4.576 6.651m10.671 7.226-4.169 7.227m0 0q.456.046.922.046A9.15 9.15 0 1 0 4.576 6.651m6.502 14.453A9.15 9.15 0 0 1 4.576 6.651" fill="none"/>
    </svg>
  );
}
