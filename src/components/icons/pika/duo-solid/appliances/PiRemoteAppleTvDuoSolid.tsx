import React from 'react';

/**
 * PiRemoteAppleTvDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiRemoteAppleTvDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRemoteAppleTvDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'remote-apple-tv icon',
  ...props
}: PiRemoteAppleTvDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M10.8 1h-.041c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.748 1.748c-.247.485-.346 1.002-.392 1.564C5 5.29 5 5.954 5 6.758v10.483c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392.541.044 1.206.044 2.01.044h2.484c.805 0 1.47 0 2.01-.044.563-.046 1.08-.145 1.565-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01V6.758c0-.805 0-1.47-.044-2.01-.046-.563-.145-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392C14.71 1 14.046 1 13.242 1z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M8.9 7a3.1 3.1 0 1 1 6.2 0 3.1 3.1 0 0 1-6.2 0Zm6.2 8a1.1 1.1 0 0 0-2.2 0v3a1.1 1.1 0 0 0 2.2 0zM14 10.9a1.1 1.1 0 0 1 1.1 1.1v.01a1.1 1.1 0 0 1-2.2 0V12a1.1 1.1 0 0 1 1.1-1.1ZM11.1 12a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 0 0 2.2 0zM10 13.9a1.1 1.1 0 0 1 1.1 1.1v.01a1.1 1.1 0 0 1-2.2 0V15a1.1 1.1 0 0 1 1.1-1.1Zm1.1 4.1a1.1 1.1 0 0 0-2.2 0v.01a1.1 1.1 0 0 0 2.2 0z" clipRule="evenodd"/>
    </svg>
  );
}
