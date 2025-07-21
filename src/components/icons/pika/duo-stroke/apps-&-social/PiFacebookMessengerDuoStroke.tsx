import React from 'react';

/**
 * PiFacebookMessengerDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiFacebookMessengerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFacebookMessengerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'facebook-messenger icon',
  ...props
}: PiFacebookMessengerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="M3 11.73C3 6.715 6.93 3 12 3s9 3.717 9 8.732-3.93 8.73-9 8.73a10 10 0 0 1-2.605-.347.72.72 0 0 0-.482.036l-1.787.788a.72.72 0 0 1-1.01-.637l-.05-1.602a.7.7 0 0 0-.24-.513C4.076 16.621 3 14.353 3 11.73Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="m8 14 2.165-3.031a.5.5 0 0 1 .752-.071l2.3 2.193a.5.5 0 0 0 .76-.083L16 10" fill="none"/>
    </svg>
  );
}
