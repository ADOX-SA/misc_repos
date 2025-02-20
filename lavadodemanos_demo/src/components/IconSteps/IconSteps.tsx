import * as React from "react";

type SvgIconProps = {
    width?: number | string;
    height?: number | string;
    color?: string;
};

const SvgIcon: React.FC<SvgIconProps> = ({ width = 72, height = 72, color = "#D9D9D9" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 72 72"
    >
        <path
            fill={color}
            d="M70.286 36c0 18.935-15.35 34.286-34.286 34.286-18.935 0-34.286-15.35-34.286-34.286C1.714 17.065 17.064 1.714 36 1.714c18.935 0 34.286 15.35 34.286 34.286m-60 0c0 14.202 11.512 25.715 25.714 25.715S61.715 50.202 61.715 36 50.202 10.285 36 10.285 10.285 21.798 10.285 36"
        />
        <path
            fill={color}
            d="M27.642 53.683a3.847 3.847 0 0 0 5.534 0c1.528-1.566-2.188-7.081-3.716-8.647l-7.352-8.363a3.847 3.847 0 0 0-5.533 0c-1.528 1.565-1.528 4.104 0 5.67z"
        />
        <path
            fill={color}
            d="M46.08 22.203c1.281-1.783 3.73-2.163 5.47-.85s2.112 3.823.83 5.606L33.176 53.683c-1.282 1.783-4.911-1.32-6.65-2.633-1.74-1.314 1.652-4.231 2.934-6.014z"
        />
    </svg>
);

export default SvgIcon;
