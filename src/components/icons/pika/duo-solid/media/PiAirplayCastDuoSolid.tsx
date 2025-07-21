import React from 'react';

/**
 * PiAirplayCastDuoSolid icon from the duo-solid style in media category.
 */
interface PiAirplayCastDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplayCastDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'airplay-cast icon',
  ...props
}: PiAirplayCastDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M9.357 3h5.286c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C22 8.4 22 9.273 22 10.357v1.286c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-1.507 1.769 1 1 0 1 1-1.18-1.616 3 3 0 0 0 .905-1.061c.134-.263.226-.611.276-1.216.05-.617.051-1.41.051-2.546v-1.2c0-1.137 0-1.929-.051-2.546-.05-.605-.142-.953-.276-1.216a3 3 0 0 0-1.311-1.311c-.263-.134-.611-.226-1.216-.276C16.529 5.001 15.736 5 14.6 5H9.4c-1.137 0-1.929 0-2.546.051-.605.05-.953.142-1.216.276a3 3 0 0 0-1.311 1.311c-.134.263-.226.611-.276 1.216C4.001 8.471 4 9.264 4 10.4v1.2c0 1.137 0 1.929.051 2.546.05.605.142.953.276 1.216a3 3 0 0 0 .906 1.062 1 1 0 0 1-1.178 1.617 5 5 0 0 1-1.51-1.771c-.302-.592-.428-1.232-.487-1.961C2 13.6 2 12.727 2 11.643v-1.286c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 4.73 3.544c.592-.302 1.233-.428 1.961-.487C7.4 3 8.273 3 9.357 3Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M13.182 14.016a3 3 0 0 0-2.364 0c-.528.226-.913.635-1.243 1.07-.325.428-.683 1-1.111 1.685l-.805 1.287c-.23.369-.438.701-.58.984-.144.284-.304.671-.268 1.118a2 2 0 0 0 .8 1.446c.36.267.774.336 1.091.365.315.03.708.03 1.142.029h4.312c.434 0 .827 0 1.142-.029.317-.029.73-.098 1.09-.365a2 2 0 0 0 .801-1.446c.036-.447-.124-.834-.268-1.118-.142-.283-.35-.615-.58-.984l-.805-1.287c-.428-.685-.786-1.257-1.11-1.685-.331-.435-.716-.844-1.244-1.07Z"/>
    </svg>
  );
}
