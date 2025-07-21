import React from 'react';

/**
 * PiNoteDefaultDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiNoteDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNoteDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'note-default icon',
  ...props
}: PiNoteDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 7.8v7.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.31C18.72 20 17.88 20 16.2 20H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V7.8" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12.666h10M7 18h7m2.2-16H7.8c-1.68 0-2.52 0-3.162.436-.564.384-1.023.996-1.311 1.748-.27.708-.317 1.596-.325 3.149h17.996c-.008-1.553-.055-2.441-.325-3.149-.288-.752-.746-1.364-1.311-1.748C18.72 2 17.88 2 16.2 2Z" fill="none"/>
    </svg>
  );
}
