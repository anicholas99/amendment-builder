import React from 'react';

/**
 * PiFile02MusicNoteContrast icon from the contrast style in files-&-folders category.
 */
interface PiFile02MusicNoteContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02MusicNoteContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-music-note icon',
  ...props
}: PiFile02MusicNoteContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m1 15.5a1.5 1.5 0 1 1-3 .002 1.5 1.5 0 0 1 3-.001Zm0 0v-6.678a.82.82 0 0 1 1.187-.734A3.28 3.28 0 0 1 15 13.023a3.6 3.6 0 0 1-.312 1.477M20 10v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Z" fill="none"/>
    </svg>
  );
}
