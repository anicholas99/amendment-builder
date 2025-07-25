import React from 'react';

/**
 * PiPhotoImagePortraitDuoStroke icon from the duo-stroke style in media category.
 */
interface PiPhotoImagePortraitDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImagePortraitDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-portrait icon',
  ...props
}: PiPhotoImagePortraitDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C7.8 22 9.2 22 12 22s4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C20 18.2 20 16.8 20 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C16.2 2 14.8 2 12 2s-4.2 0-5.27.545A5 5 0 0 0 4.545 4.73C4 5.8 4 7.2 4 10Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 7.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/><path fill="none" d="M19 11.098c-.738.061-1.31.158-1.817.307a10 10 0 0 0-6.778 6.778c-.211.72-.316 1.557-.364 2.807a20 20 0 0 1-1.244-.055 7 7 0 0 1-.752-.095c.053-1.287.17-2.296.441-3.22a12 12 0 0 1 8.133-8.134c.717-.21 1.48-.327 2.38-.394L19 10z"/><path fill="none" d="M21 10.025v.03z"/>
    </svg>
  );
}
