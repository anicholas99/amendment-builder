import React from 'react';

/**
 * PiFilmDuoSolid icon from the duo-solid style in media category.
 */
interface PiFilmDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFilmDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'film icon',
  ...props
}: PiFilmDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M7 2.141c-.63.09-1.196.244-1.724.513a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359l-.02.292-.002.023C2 8.766 2 9.752 2 10.956v2.088c0 1.204 0 2.19.05 3.006v.023l.021.293c.074.895.227 1.659.583 2.358a6 6 0 0 0 2.622 2.622c.528.27 1.093.422 1.724.513V19.83a3 3 0 0 1-.816-.267 4 4 0 0 1-1.748-1.748A3 3 0 0 1 4.169 17H7v-2H4.011A118 118 0 0 1 4 13h3v-2H4c0-.782 0-1.438.011-2H7V7H4.169a3 3 0 0 1 .267-.816 4 4 0 0 1 1.748-1.748c.222-.113.48-.201.816-.267z"/><path fill={color || "currentColor"} d="M17 21.859c.63-.09 1.196-.244 1.724-.513a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.358l.02-.293.002-.023c.049-.816.049-1.802.049-3.006v-2.088c0-1.204 0-2.19-.05-3.006v-.023l-.021-.292c-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.528-.27-1.093-.422-1.724-.513V4.17c.337.066.594.154.816.267a4 4 0 0 1 1.748 1.748c.113.222.201.48.267.816H17v2h2.989c.01.562.011 1.218.011 2h-3v2h3c0 .782 0 1.438-.011 2H17v2h2.831a3 3 0 0 1-.267.816 4 4 0 0 1-1.748 1.748c-.222.113-.48.201-.816.267z"/></g><path fill={color || "currentColor"} fillRule="evenodd" d="M7 21.859a11 11 0 0 0 .927.09l.023.002C8.766 22 9.752 22 10.956 22h2.088c1.204 0 2.19 0 3.006-.05h.023l.292-.021q.329-.027.635-.07V2.14a11 11 0 0 0-.927-.09l-.023-.002C15.234 2 14.248 2 13.044 2h-2.088c-1.204 0-2.19 0-3.006.05h-.023l-.292.021q-.329.027-.635.07zM7.9 12a1 1 0 0 1 1-1h6.2a1 1 0 1 1 0 2H8.9a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
    </svg>
  );
}
