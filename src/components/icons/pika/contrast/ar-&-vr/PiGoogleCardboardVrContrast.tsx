import React from 'react';

/**
 * PiGoogleCardboardVrContrast icon from the contrast style in ar-&-vr category.
 */
interface PiGoogleCardboardVrContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGoogleCardboardVrContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'google-cardboard-vr icon',
  ...props
}: PiGoogleCardboardVrContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.327 7.638C2 8.28 2 9.12 2 10.8v2.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 18 5.12 18 6.8 18h.236c.718 0 1.077 0 1.394-.11a2 2 0 0 0 .747-.461c.24-.235.4-.556.72-1.198l.672-1.342c.59-1.18 2.272-1.18 2.862 0l.671 1.342c.321.642.482.963.721 1.198a2 2 0 0 0 .747.462c.317.109.676.109 1.394.109h.236c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 15.72 22 14.88 22 13.2v-2.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 6 18.88 6 17.2 6H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.327 7.638C2 8.28 2 9.12 2 10.8v2.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 18 5.12 18 6.8 18h.236c.718 0 1.077 0 1.394-.11a2 2 0 0 0 .747-.461c.24-.235.4-.556.72-1.198l.672-1.342c.59-1.18 2.272-1.18 2.862 0l.671 1.342c.321.642.482.963.721 1.198a2 2 0 0 0 .747.462c.317.109.676.109 1.394.109h.236c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 15.72 22 14.88 22 13.2v-2.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 6 18.88 6 17.2 6H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none"/>
    </svg>
  );
}
