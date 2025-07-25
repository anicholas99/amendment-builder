import React from 'react';

/**
 * PiNoteDefaultContrast icon from the contrast style in editing category.
 */
interface PiNoteDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNoteDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'note-default icon',
  ...props
}: PiNoteDefaultContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M16.2 4H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311c-.27.53-.317 1.197-.325 2.362h17.996c-.008-1.165-.055-1.831-.325-2.362a3 3 0 0 0-1.311-1.311C18.72 4 17.88 4 16.2 4Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12h10M7 16h7m6.998-8q.003.366.002.8v6.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 20 17.88 20 16.2 20H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V8.8q0-.434.002-.8m17.996 0c-.008-1.165-.055-1.831-.325-2.362a3 3 0 0 0-1.311-1.311C18.72 4 17.88 4 16.2 4H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311c-.27.53-.317 1.197-.325 2.362m17.996 0H3.002" fill="none"/>
    </svg>
  );
}
