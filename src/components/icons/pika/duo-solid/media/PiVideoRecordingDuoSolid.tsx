import React from 'react';

/**
 * PiVideoRecordingDuoSolid icon from the duo-solid style in media category.
 */
interface PiVideoRecordingDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVideoRecordingDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'video-recording icon',
  ...props
}: PiVideoRecordingDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.604c-.027 1.387-.124 2.245-.481 2.946a4.5 4.5 0 0 1-1.969 1.969c-.7.357-1.56.454-2.946.481M21 8.396c-.027-1.387-.124-2.245-.481-2.946a4.5 4.5 0 0 0-1.969-1.97c-.7-.357-1.56-.454-2.946-.481M8.396 3c-1.387.027-2.245.124-2.946.481A4.5 4.5 0 0 0 3.48 5.45c-.357.7-.454 1.56-.481 2.946m0 7.208c.027 1.387.124 2.245.481 2.946a4.5 4.5 0 0 0 1.97 1.97c.7.357 1.56.454 2.946.481" opacity=".28"/><path fill={color || "currentColor"} d="M10.158 7.396c-.597 0-1.104 0-1.521.034-.438.036-.862.114-1.267.32-.612.312-1.11.81-1.422 1.422-.206.405-.285.83-.32 1.267-.034.417-.034.924-.034 1.521v.08c0 .597 0 1.104.034 1.52.035.438.114.863.32 1.268.312.612.81 1.11 1.422 1.422.405.206.83.284 1.267.32.416.034.924.034 1.521.034h.98c.597 0 1.105 0 1.522-.034.437-.036.861-.114 1.267-.32.515-.263.95-.657 1.26-1.14l.13.104c1.245.995 3.089.11 3.089-1.485v-3.458c0-1.594-1.844-2.48-3.089-1.485l-.13.105a3.25 3.25 0 0 0-1.26-1.14c-.406-.207-.83-.285-1.267-.321-.417-.034-.925-.034-1.522-.034z"/>
    </svg>
  );
}
