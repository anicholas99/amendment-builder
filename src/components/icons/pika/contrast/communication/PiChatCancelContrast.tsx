import React from 'react';

/**
 * PiChatCancelContrast icon from the contrast style in communication category.
 */
interface PiChatCancelContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChatCancelContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chat-cancel icon',
  ...props
}: PiChatCancelContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 21a9 9 0 1 0-8.91-7.728c.17 1.203.255 1.805.267 1.964.02.257.016.165.014.423 0 .159-.014.34-.04.702l-.153 2.153c-.062.858-.092 1.286.06 1.607.133.281.36.508.641.641.32.152.75.122 1.607.06l2.153-.153c.362-.026.543-.04.702-.04.258-.002.166-.006.423.014.159.012.76.098 1.963.268h.001Q11.352 21 12 21Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 14.5 12 12m0 0 2.5-2.5M12 12 9.5 9.5M12 12l2.5 2.5M21 12a9 9 0 0 1-10.272 8.91c-1.203-.17-1.805-.255-1.964-.267-.257-.02-.165-.016-.423-.014-.159 0-.34.014-.702.04l-2.153.153c-.857.062-1.286.092-1.607-.06a1.35 1.35 0 0 1-.641-.641c-.152-.32-.122-.75-.06-1.607l.153-2.153c.026-.362.04-.543.04-.702.002-.258.006-.166-.014-.423-.012-.159-.098-.76-.268-1.964A9 9 0 1 1 21 12Z" fill="none"/>
    </svg>
  );
}
