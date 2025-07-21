import React from 'react';

/**
 * PiBottleMilkGlassDuoSolid icon from the duo-solid style in food category.
 */
interface PiBottleMilkGlassDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBottleMilkGlassDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bottle-milk-glass icon',
  ...props
}: PiBottleMilkGlassDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14 1a1 1 0 1 1 0 2v2.056c0 .379.002.474.015.562l.025.137q.016.067.038.133l.067.159c.034.074.087.18.171.35l.302.603H10a3 3 0 0 0-2.972 3.413l.834 6 .354 2.55.123.853c.043.282.09.555.145.806.118.538.31 1.189.723 1.836l.225.326q.083.11.172.216H8c-.684 0-1.257.001-1.724-.037-.418-.034-.819-.104-1.202-.268l-.163-.077a3.5 3.5 0 0 1-1.394-1.288l-.135-.241c-.22-.432-.306-.887-.345-1.365C3 19.257 3 18.684 3 18v-7.056c0-.325-.002-.582.034-.84l.026-.16q.044-.24.123-.47l.068-.183c.075-.182.168-.365.277-.583l1.156-2.31.171-.351c.035-.074.053-.117.067-.16l.038-.132q.015-.067.025-.137l.012-.172C5 5.364 5 5.246 5 5.056V3a1 1 0 0 1 0-2z" opacity=".28"/><path fill={color || "currentColor"} d="M21 9a1 1 0 0 1 .99 1.138l-.556 4-.632 4.55c-.083.596-.152 1.099-.241 1.508-.08.37-.188.718-.371 1.047l-.083.14a3.5 3.5 0 0 1-1.268 1.185l-.224.114c-.398.182-.808.254-1.238.287-.417.032-.925.031-1.527.031h-.701c-.602 0-1.11 0-1.527-.031a3.7 3.7 0 0 1-1.087-.224l-.15-.063a3.5 3.5 0 0 1-1.35-1.092l-.143-.207c-.235-.37-.362-.765-.454-1.187-.09-.409-.159-.912-.241-1.509l-.355-2.55-.833-6A1 1 0 0 1 10 9zm-9.39 5.325.096-.06c.507-.32.904-.578 1.34-.722l.227-.066a3.5 3.5 0 0 1 1.63-.027l.167.043c.388.112.769.308 1.239.543.718.359.907.444 1.077.477l.113.017c.262.03.528-.01.77-.116l.129-.067c.143-.088.352-.254.818-.635l.291-.238.344-2.474h-8.703z"/>
    </svg>
  );
}
