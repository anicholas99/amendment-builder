import React from 'react';

/**
 * PiAirplaneDefaultDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiAirplaneDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplaneDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'airplane-default icon',
  ...props
}: PiAirplaneDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M10 9.75a1 1 0 0 0-1.6-.8L2.6 13.3A4 4 0 0 0 1 16.5v.5a1 1 0 0 0 1.258.966l7-1.866a1 1 0 0 0 .742-.967zm5.6-.8a1 1 0 0 0-1.6.8v5.383a1 1 0 0 0 .742.967l7 1.866A1 1 0 0 0 23 17v-.5a4 4 0 0 0-1.6-3.2z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12 1c-.353 0-.706.135-.956.256a4.3 4.3 0 0 0-.869.56C9.655 2.245 9 3 9 4v4.5l-6.4 4.8A4 4 0 0 0 1 16.5v.5a1 1 0 0 0 1.258.966l6.412-1.71.261 1.833-2.211 1.843A2 2 0 0 0 6 21.468V22a1 1 0 0 0 1.196.98c1.395-.278 4.306-.477 4.804-.51.498.033 3.409.232 4.804.51A1 1 0 0 0 18 22v-.532a2 2 0 0 0-.72-1.536l-2.211-1.843.261-1.832 6.412 1.71A1 1 0 0 0 23 17v-.5a4 4 0 0 0-1.6-3.2L15 8.5V4c0-1-.655-1.754-1.175-2.185a4.3 4.3 0 0 0-.869-.56C12.706 1.136 12.353 1 12 1Z" clipRule="evenodd" opacity=".28"/>
    </svg>
  );
}
