import React from 'react';

/**
 * PiMapLocationDuoSolid icon from the duo-solid style in navigation category.
 */
interface PiMapLocationDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapLocationDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'map-location icon',
  ...props
}: PiMapLocationDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14.366 14.757c-.554.325-1.423.743-2.366.743s-1.813-.418-2.367-.743a9 9 0 0 1-1.948-1.565c-1.221-1.29-2.396-3.263-2.396-5.748 0-1.134.22-2.139.602-3.007l-1.68.84c-.532.264-.999.497-1.354.86a3 3 0 0 0-.693 1.12C2 7.738 2 8.26 2 8.854v6.069c0 .794 0 1.456.047 1.98.047.534.152 1.074.466 1.54a3 3 0 0 0 2.098 1.297c.557.072 1.088-.076 1.586-.271.49-.193 1.082-.49 1.792-.844l.042-.021c.56-.28.675-.328.777-.348a1 1 0 0 1 .384 0c.102.02.217.067.777.348l3.243 1.621c.435.218.818.41 1.235.488a3 3 0 0 0 1.106 0c.417-.078.8-.27 1.236-.488l3-1.5c.532-.265 1-.498 1.354-.86a3 3 0 0 0 .693-1.122c.166-.48.165-1.002.164-1.595v-6.07c0-.794 0-1.456-.047-1.98-.047-.534-.152-1.074-.466-1.54a3 3 0 0 0-2.098-1.297c-.447-.058-.877.026-1.287.162.387.872.608 1.881.608 3.021 0 2.485-1.175 4.459-2.396 5.748a9 9 0 0 1-1.948 1.565Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M8.83 3.39A5.2 5.2 0 0 1 12 2.25c.94 0 2.165.324 3.17 1.14 1.032.838 1.79 2.164 1.79 4.054 0 1.912-.905 3.477-1.916 4.544a7.3 7.3 0 0 1-1.563 1.26c-.477.28-1.014.502-1.481.502s-1.005-.223-1.482-.502a7.3 7.3 0 0 1-1.563-1.26C7.945 10.921 7.04 9.356 7.04 7.444c0-1.89.758-3.216 1.79-4.054ZM12 5.9a1.1 1.1 0 0 0 0 2.2h.01a1.1 1.1 0 0 0 0-2.2z" clipRule="evenodd"/>
    </svg>
  );
}
