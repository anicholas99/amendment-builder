import React from 'react';

/**
 * PiStickerCornerFoldedDuoStroke icon from the duo-stroke style in media category.
 */
interface PiStickerCornerFoldedDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStickerCornerFoldedDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sticker-corner-folded icon',
  ...props
}: PiStickerCornerFoldedDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h6a8 8 0 0 0 8-8V7a4 4 0 0 0-4-4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13a8 8 0 0 1-8 8H9c1.146 0 1.72 0 2.178-.167a2.77 2.77 0 0 0 1.655-1.655C13 18.719 13 18.146 13 17v-1.046c0-1.034 0-1.551.201-1.946.177-.347.46-.63.807-.807.395-.201.912-.201 1.946-.201H17c1.146 0 1.72 0 2.178-.167a2.77 2.77 0 0 0 1.655-1.655C21 10.719 21 10.146 21 9z" fill="none"/>
    </svg>
  );
}
