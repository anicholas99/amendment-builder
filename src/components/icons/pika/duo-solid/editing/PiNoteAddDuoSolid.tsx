import React from 'react';

/**
 * PiNoteAddDuoSolid icon from the duo-solid style in editing category.
 */
interface PiNoteAddDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNoteAddDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'note-add icon',
  ...props
}: PiNoteAddDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M7.757 2h8.481c.805 0 1.47 0 2.01.044.563.046 1.08.145 1.565.392a4 4 0 0 1 1.748 1.748c.396.776.427 1.688.434 2.809a1 1 0 0 1-1 1.007H3a1 1 0 0 1-1-1.007c.008-1.121.038-2.033.434-2.809a4 4 0 0 1 1.748-1.748c.485-.247 1.002-.346 1.564-.392C6.288 2 6.953 2 7.757 2Zm-1.759 9a1 1 0 0 1 1-1h10a1 1 0 0 1 0 2h-10a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h7a1 1 0 0 1 0 2h-7a1 1 0 0 1-1-1Zm15 0a1 1 0 1 0-2 0v2h-2a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2h-2z" clipRule="evenodd"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.125V8.8q0-.434-.002-.8m-7.873 12H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V8.8q0-.434.002-.8" opacity=".28"/>
    </svg>
  );
}
