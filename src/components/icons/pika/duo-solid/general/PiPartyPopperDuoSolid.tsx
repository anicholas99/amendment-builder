import React from 'react';

/**
 * PiPartyPopperDuoSolid icon from the duo-solid style in general category.
 */
interface PiPartyPopperDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPartyPopperDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'party-popper icon',
  ...props
}: PiPartyPopperDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M10.243 1.37a1 1 0 0 0-1.552 1.26c1.04 1.28 1.377 3.004.86 4.554a1 1 0 1 0 1.898.632c.74-2.221.25-4.656-1.206-6.447Z"/><path fill={color || "currentColor"} d="M6.711 9.139a1 1 0 0 1 .06 1.413c-.045.049-.167.217-.356.555l-.049.087c.476 1.08 1.439 2.425 2.727 3.713 1.287 1.287 2.632 2.25 3.711 2.726l.086-.047c.341-.191.51-.313.558-.356a1 1 0 0 1 1.354 1.472c-.234.214-.582.431-.936.63-.377.21-.838.44-1.35.677a37 37 0 0 1-3.575 1.418c-1.271.428-2.594.79-3.717.944-.56.076-1.114.108-1.607.05-.471-.055-1.042-.208-1.458-.643-.407-.424-.547-.988-.595-1.46-.05-.492-.015-1.044.064-1.603.16-1.122.523-2.437.952-3.7.432-1.272.943-2.53 1.415-3.547.235-.508.466-.966.675-1.34.198-.352.414-.697.628-.93a1 1 0 0 1 1.413-.06Z"/><path fill={color || "currentColor"} d="M16 11a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2z"/><path fill={color || "currentColor"} d="M16.859 14.01c2.186-.312 4.616.172 5.999 2.476a1 1 0 0 1-1.716 1.029c-.81-1.35-2.255-1.774-4-1.525a1 1 0 0 1-.283-1.98Z"/></g><path fill={color || "currentColor"} d="M13 4a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H14a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M22.958 4.062a1 1 0 0 1-.67 1.245c-3.224.968-5.998 2.64-7.988 5.293a1 1 0 1 1-1.6-1.2c2.302-3.07 5.48-4.948 9.013-6.008a1 1 0 0 1 1.245.67Z"/><path fill={color || "currentColor"} d="M8.954 8.599c1.144.572 2.448 1.547 3.674 2.773 1.227 1.226 2.202 2.53 2.774 3.674.283.567.494 1.146.558 1.688.062.528.002 1.204-.503 1.709-.384.384-.874.512-1.307.523-.855.022-1.846-.397-2.765-.951-.961-.58-2.003-1.405-3-2.4-.995-.996-1.82-2.038-2.4-3-.553-.919-.972-1.91-.95-2.765.01-.432.139-.923.522-1.306.505-.505 1.181-.566 1.709-.503.542.064 1.121.274 1.688.558Z"/><path fill={color || "currentColor"} d="M17 19a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H18a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M6 4a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2z"/><path fill={color || "currentColor"} d="M21 9a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
