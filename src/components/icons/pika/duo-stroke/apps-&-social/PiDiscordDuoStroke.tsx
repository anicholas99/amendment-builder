import React from 'react';

/**
 * PiDiscordDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiDiscordDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDiscordDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'discord icon',
  ...props
}: PiDiscordDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.914 16.5C19.931 20 16.491 20 16.491 20l-1.166-2.426c-2.444.735-4.202.735-6.646 0L7.509 20s-3.44 0-5.423-3.5a.5.5 0 0 1-.065-.24c-.029-1.37-.39-7.863 3.475-10.76 1.098-.758 2.474-1.211 3.129-1.4a.476.476 0 0 1 .556.252l.683 1.37a.5.5 0 0 0 .448.277h3.38a.5.5 0 0 0 .449-.278l.678-1.368a.476.476 0 0 1 .557-.253c.656.188 2.03.642 3.128 1.399 3.864 2.897 3.504 9.39 3.475 10.76a.5.5 0 0 1-.065.24Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.001 17c.6.225 1.155.416 1.678.573 2.444.736 4.202.736 6.646 0A27 27 0 0 0 17.004 17m-7.002-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6.001 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/>
    </svg>
  );
}
