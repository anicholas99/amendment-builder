import React from 'react';

/**
 * PiPhoneRemoveDuoSolid icon from the duo-solid style in communication category.
 */
interface PiPhoneRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhoneRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'phone-remove icon',
  ...props
}: PiPhoneRemoveDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.407 12.974a15.8 15.8 0 0 0 5.307 5.43" opacity=".28"/><path fill={color || "currentColor"} d="M4.736 2.06c.516-.084 1.101-.067 1.541-.027 1.165.105 2.002.69 2.576 1.45.548.726.855 1.608 1.052 2.377a6.43 6.43 0 0 1-1.859 6.313c-.473.438-1.023.845-1.514 1.208-.182.135-.357.264-.515.386a1 1 0 0 1-1.471-.285c-1.314-2.226-2.168-4.805-2.504-7.656-.19-1.615.799-3.456 2.694-3.766Z"/><path fill={color || "currentColor"} d="M11.985 15.484a6.43 6.43 0 0 1 5.763-1.51c.797.182 1.747.47 2.544 1.005.829.558 1.514 1.405 1.66 2.64a6 6 0 0 1-.017 1.645c-.31 1.894-2.15 2.885-3.765 2.694-2.991-.353-5.684-1.277-7.983-2.704a1 1 0 0 1-.228-1.505 28 28 0 0 0 .475-.564c.461-.555.985-1.186 1.55-1.7Z"/><path fill={color || "currentColor"} d="M14 6a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
