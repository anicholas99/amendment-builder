import React from 'react';

/**
 * PiPencilEditAIContrast icon from the contrast style in ai category.
 */
interface PiPencilEditAIContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEditAIContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-edit-ai icon',
  ...props
}: PiPencilEditAIContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M3.126 17.573c-.046.177-.05.365-.06.742L3 20.995 5.727 21c.39 0 .584 0 .767-.043q.246-.06.46-.191c.161-.1.299-.237.574-.514l12.973-13.03.061-.062a1.6 1.6 0 0 0 .197-1.944l-.047-.073-.034-.052a6.3 6.3 0 0 0-1.851-1.84 1.57 1.57 0 0 0-1.964.212L3.81 16.573c-.266.267-.398.4-.495.555q-.128.208-.19.445Z" fill="none" stroke="currentColor"/><path d="M22 18c-1.66-.655-2.363-1.384-3-3-.637 1.616-1.34 2.345-3 3 1.66.655 2.363 1.384 3 3 .637-1.616 1.34-2.345 3-3Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 22h.01M3 20.995 5.727 21c.39 0 .584 0 .767-.043q.246-.06.46-.191c.161-.1.299-.237.574-.514l12.973-13.03c.53-.533.662-1.356.258-2.006a6.3 6.3 0 0 0-1.932-1.965 1.57 1.57 0 0 0-1.964.212L3.81 16.573c-.266.267-.398.4-.495.555q-.128.208-.19.445c-.045.177-.05.365-.059.742zM19 15c-.637 1.616-1.34 2.345-3 3 1.66.655 2.363 1.384 3 3 .637-1.616 1.34-2.345 3-3-1.66-.655-2.363-1.384-3-3Z" fill="none"/>
    </svg>
  );
}
