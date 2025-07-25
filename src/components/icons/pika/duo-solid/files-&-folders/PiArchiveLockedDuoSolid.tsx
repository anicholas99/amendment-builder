import React from 'react';

/**
 * PiArchiveLockedDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiArchiveLockedDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArchiveLockedDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'archive-locked icon',
  ...props
}: PiArchiveLockedDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 2a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M4 9a1 1 0 0 0-1 1v7a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-7a1 1 0 0 0-1-1z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.92 15.05c-.208-.04-.49-.04-.982-.04h-1.876c-.49 0-.774 0-.982.04m3.84 0c.641.129 1.12.73 1.156 1.374.03.529-.167 1.283-.407 1.76a1.5 1.5 0 0 1-1.01.79c-.164.036-.349.036-.72.036h-1.877c-.372 0-.557 0-.72-.037a1.5 1.5 0 0 1-1.01-.79c-.24-.476-.439-1.23-.408-1.76.037-.641.515-1.244 1.156-1.372m3.84 0c-.05-.616-.03-1.29-.176-1.894a1.5 1.5 0 0 0-1.227-1.13c-.323-.05-.71-.05-1.034 0a1.5 1.5 0 0 0-1.227 1.13c-.147.604-.125 1.278-.176 1.894"/>
    </svg>
  );
}
