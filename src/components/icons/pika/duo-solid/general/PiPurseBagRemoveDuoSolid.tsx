import React from 'react';

/**
 * PiPurseBagRemoveDuoSolid icon from the duo-solid style in general category.
 */
interface PiPurseBagRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPurseBagRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'purse-bag-remove icon',
  ...props
}: PiPurseBagRemoveDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2c2.433 0 4.47 1.786 4.91 4.088.367.052.712.137 1.046.281l.277.132a4.5 4.5 0 0 1 1.602 1.388l.108.16c.238.377.398.788.532 1.247.15.512.285 1.146.451 1.92l.393 1.834.37 1.77c.105.53.188 1.003.24 1.426.093.748.105 1.426-.056 2.07l-.08.273a5 5 0 0 1-2.002 2.595l-.192.119c-.658.39-1.405.549-2.263.624-.849.074-1.916.073-3.253.073H9.916c-1.336 0-2.403.001-3.252-.073-.75-.066-1.416-.196-2.012-.488l-.251-.136A5 5 0 0 1 2.284 18.8l-.077-.212c-.243-.726-.241-1.489-.135-2.343.105-.846.33-1.89.61-3.196l.392-1.833.231-1.059q.109-.479.22-.862c.153-.524.34-.986.64-1.407l.186-.243a4.5 4.5 0 0 1 1.693-1.277l.222-.087c.264-.093.537-.154.822-.194C7.528 3.786 9.568 2 12 2Zm0 2c-1.28 0-2.393.846-2.816 2h5.632C14.393 4.846 13.28 4 12 4Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14h6"/>
    </svg>
  );
}
