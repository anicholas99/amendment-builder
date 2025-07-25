import React from 'react';

/**
 * PiMessageAISolid icon from the solid style in ai category.
 */
interface PiMessageAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMessageAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'message-ai icon',
  ...props
}: PiMessageAISolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M16.2 2c.824 0 1.502-.001 2.052.044.562.046 1.08.144 1.564.392l.276.154a4 4 0 0 1 1.473 1.594l.085.183c.186.432.266.89.306 1.381.045.55.044 1.228.044 2.052v4.4c0 .824.001 1.502-.044 2.052-.04.492-.12.95-.306 1.38l-.085.184a4 4 0 0 1-1.473 1.594l-.276.154c-.485.248-1.002.346-1.564.392-.55.045-1.228.044-2.052.044h-2.848l-4.727 3.781A1.001 1.001 0 0 1 7 21v-3.004c-.475-.003-.891-.01-1.252-.04-.492-.04-.95-.12-1.38-.306l-.184-.085a4 4 0 0 1-1.594-1.473l-.154-.276c-.248-.485-.346-1.002-.392-1.564C1.999 13.702 2 13.024 2 12.2V7.8c0-.824-.001-1.502.044-2.052.046-.562.144-1.08.392-1.564l.154-.276a4 4 0 0 1 1.594-1.472l.183-.086c.432-.186.89-.266 1.381-.306C6.298 1.999 6.976 2 7.8 2zM8.5 12.675a1 1 0 1 0 0 2l.104-.005a1 1 0 0 0 0-1.99zm4-7a1 1 0 0 0-.864.496l-.067.137c-.293.742-.565 1.19-.895 1.523-.288.29-.67.543-1.27.802l-.271.111a1 1 0 0 0 0 1.861l.271.112c.6.259.982.511 1.27.802.33.332.602.78.895 1.523l.067.137a1 1 0 0 0 1.795-.137c.293-.743.565-1.191.895-1.523s.781-.614 1.541-.914a1 1 0 0 0 .137-1.794l-.137-.067c-.76-.3-1.212-.581-1.54-.913-.33-.332-.603-.78-.896-1.523a1 1 0 0 0-.931-.633Z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
