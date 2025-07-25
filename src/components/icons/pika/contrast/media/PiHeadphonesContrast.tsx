import React from 'react';

/**
 * PiHeadphonesContrast icon from the contrast style in media category.
 */
interface PiHeadphonesContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadphonesContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'headphones icon',
  ...props
}: PiHeadphonesContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="m19.944 19.277 1.05-3.657a2.378 2.378 0 0 0-4.573-1.311l-1.048 3.657a2.378 2.378 0 0 0 4.571 1.311Z" fill="none" stroke="currentColor"/><path d="M8.627 17.966 7.58 14.31a2.378 2.378 0 1 0-4.572 1.31l1.049 3.658a2.378 2.378 0 1 0 4.571-1.31Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.993 15.618a2.378 2.378 0 0 0-4.572-1.31l-1.049 3.658a2.378 2.378 0 1 0 4.572 1.31zm0 0a9.5 9.5 0 0 0 .519-3.106 9.512 9.512 0 1 0-19.024 0c0 1.088.182 2.132.518 3.105m17.987.001-.007.022m-17.98-.023a2.378 2.378 0 0 1 4.573-1.309l1.048 3.658a2.378 2.378 0 0 1-4.571 1.31zm0 0 .018.052" fill="none"/>
    </svg>
  );
}
