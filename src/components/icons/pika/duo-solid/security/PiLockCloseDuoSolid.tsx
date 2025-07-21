import React from 'react';

/**
 * PiLockCloseDuoSolid icon from the duo-solid style in security category.
 */
interface PiLockCloseDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLockCloseDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'lock-close icon',
  ...props
}: PiLockCloseDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.67 8c-.809 0-1.478 0-2.031.031-.561.032-1.07.1-1.54.263q-.175.06-.34.139c-1.218.575-2.132 1.66-2.548 2.966-.173.543-.218 1.114-.21 1.76.007.633.068 1.41.143 2.382l.018.241c.118 1.522.197 2.55.578 3.39.508 1.117 1.397 2.01 2.51 2.476.467.197.952.277 1.489.315.518.037 1.15.037 1.922.037h4.678c.772 0 1.404 0 1.922-.037.537-.038 1.022-.119 1.489-.315 1.113-.467 2.002-1.359 2.51-2.476.381-.84.46-1.868.578-3.39l.018-.241c.075-.972.136-1.75.143-2.382.008-.647-.037-1.217-.21-1.76-.416-1.306-1.33-2.39-2.547-2.966a3 3 0 0 0-.34-.139c-.471-.164-.98-.23-1.541-.263C15.808 8 15.139 8 14.331 8z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M10.071 14c0-1.034.795-2 1.929-2s1.929.966 1.929 2a2.04 2.04 0 0 1-.93 1.714V17a1 1 0 1 1-2 0v-1.286A2.04 2.04 0 0 1 10.072 14Z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M5.438 8.6q.155-.09.32-.167.167-.079.34-.139c.435-.151.902-.22 1.412-.255C7.924 5.692 9.83 4 12 4s4.075 1.692 4.49 4.04c.51.034.977.103 1.412.254q.174.06.34.139.165.077.32.167C18.37 4.982 15.568 2 12 2S5.63 4.982 5.438 8.6Z"/><path fill={color || "currentColor"} d="m17.225 10.176.02.007.019.007z"/><path fill={color || "currentColor"} d="m6.77 10.178-.03.01.016-.005z"/>
    </svg>
  );
}
