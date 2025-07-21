import React from 'react';

/**
 * PiDatabaseDuoSolid icon from the duo-solid style in development category.
 */
interface PiDatabaseDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDatabaseDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'database icon',
  ...props
}: PiDatabaseDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 18.131v-4.267c0-.16.181-.257.318-.173.357.22.744.422 1.152.604C6.449 15.179 9.112 15.7 12 15.7s5.552-.521 7.53-1.405a10 10 0 0 0 1.152-.604c.137-.084.318.012.318.173v4.267c0 .803-.457 1.434-.982 1.88-.53.449-1.237.808-2.024 1.09-1.581.567-3.7.899-5.994.899s-4.413-.332-5.994-.899c-.787-.282-1.494-.641-2.024-1.09C3.457 19.565 3 18.934 3 18.13ZM16 17a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12 2c-2.288 0-4.4.311-5.977.843-.782.265-1.488.601-2.018 1.024C3.485 4.282 3 4.895 3 5.7v4.853q0 .036.013.069c.077.197.214.411.433.642.391.414 1.005.832 1.84 1.205C6.953 13.214 9.326 13.7 12 13.7s5.047-.486 6.714-1.231c.835-.373 1.449-.791 1.84-1.205a2 2 0 0 0 .433-.642.2.2 0 0 0 .013-.069V5.7c0-.805-.485-1.418-1.005-1.833-.53-.423-1.236-.76-2.018-1.024C16.4 2.311 14.287 2 12 2ZM5.252 5.43a1.2 1.2 0 0 0-.201.196.12.12 0 0 0 0 .148c.036.047.098.113.201.195.28.223.746.468 1.41.693C7.983 7.107 9.87 7.4 12 7.4s4.017-.293 5.337-.738c.665-.225 1.131-.47 1.41-.693a1.2 1.2 0 0 0 .202-.195.12.12 0 0 0 0-.148 1.2 1.2 0 0 0-.201-.195c-.28-.223-.746-.468-1.41-.693C16.017 4.293 14.13 4 12 4s-4.017.293-5.337.738c-.665.225-1.131.47-1.41.693ZM16 9a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z" clipRule="evenodd"/>
    </svg>
  );
}
