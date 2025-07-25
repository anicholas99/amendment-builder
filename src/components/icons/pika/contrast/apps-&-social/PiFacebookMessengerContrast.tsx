import React from 'react';

/**
 * PiFacebookMessengerContrast icon from the contrast style in apps-&-social category.
 */
interface PiFacebookMessengerContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFacebookMessengerContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'facebook-messenger icon',
  ...props
}: PiFacebookMessengerContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3 11.73C3 6.715 6.93 3 12 3s9 3.717 9 8.732-3.93 8.73-9 8.73a10 10 0 0 1-2.605-.347.72.72 0 0 0-.482.036l-1.787.788a.72.72 0 0 1-1.01-.637l-.05-1.602a.7.7 0 0 0-.24-.513C4.076 16.621 3 14.353 3 11.73Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2" d="m8 14 2.165-3.031a.5.5 0 0 1 .752-.071l2.3 2.193a.5.5 0 0 0 .76-.083L16 10m-4-7c-5.07 0-9 3.715-9 8.73 0 2.623 1.076 4.891 2.826 6.457.146.13.236.315.24.513l.05 1.602a.72.72 0 0 0 1.01.637l1.787-.788a.72.72 0 0 1 .482-.036 10 10 0 0 0 2.605.347c5.07 0 9-3.715 9-8.73S17.07 3 12 3Z" fill="none"/>
    </svg>
  );
}
