import React from 'react';

/**
 * PiChatTypingContrast icon from the contrast style in communication category.
 */
interface PiChatTypingContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChatTypingContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chat-typing icon',
  ...props
}: PiChatTypingContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 21a9 9 0 1 0-8.91-7.728c.17 1.203.255 1.805.267 1.964.02.257.016.165.014.423 0 .159-.014.34-.04.702l-.153 2.153c-.062.858-.092 1.286.06 1.607.133.281.36.508.641.641.32.152.75.122 1.607.06l2.153-.153c.362-.026.543-.04.702-.04.258-.002.166-.006.423.014.159.012.76.098 1.963.268h.001Q11.352 21 12 21Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01m4.178 3.737A9 9 0 0 0 21 12a9 9 0 1 0-17.911 1.272c.17 1.204.256 1.805.268 1.964.02.257.016.165.014.423 0 .16-.014.34-.04.702l-.153 2.153c-.062.857-.092 1.287.06 1.607.133.281.36.508.641.641.321.152.75.122 1.607.06l2.153-.153c.362-.026.543-.04.702-.04.258-.002.166-.006.423.014.159.012.761.097 1.964.267a9 9 0 0 0 9.46-5.173Z" fill="none"/>
    </svg>
  );
}
