import * as React from "react";

interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
    width?: number | string;
    height?: number | string;
    fill?: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({ width = 58, height = 45, fill = "none", ...props }) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill={fill}
    viewBox="0 0 58 45"
    {...props}
    >
    <path
        fill="#EFEFEF"
        d="M9.32 22.16q1.576 0 2.956-.27a17.6 17.6 0 0 0 2.8-.805 42 42 0 0 0 3.08-1.314q1.658-.78 3.777-1.798 2.135-1.035 3.67-1.758a39 39 0 0 1 2.726-1.174 14.3 14.3 0 0 1 2.259-.665 11.6 11.6 0 0 1 2.266-.213q1.15 0 2.184.205t1.996.616q.96.41 1.93.985.739.427 1.461.238a2.12 2.12 0 0 0 1.182-.796q.51-.74.32-1.626-.188-.887-1.14-1.462a14.8 14.8 0 0 0-3.803-1.675 15.3 15.3 0 0 0-4.13-.558q-1.592 0-2.997.27-1.404.271-2.833.814a45 45 0 0 0-3.096 1.322q-1.666.78-3.769 1.798-2.151 1.034-3.687 1.757a43 43 0 0 1-2.701 1.175q-1.167.451-2.218.656t-2.233.206q-1.56 0-2.997-.41-1.437-.412-2.981-1.348-.756-.427-1.486-.238a1.87 1.87 0 0 0-1.142.83q-.492.722-.32 1.61.173.886 1.125 1.444 1.117.674 2.357 1.158 1.24.485 2.603.756 1.363.27 2.84.27m0 8.935q1.576 0 2.956-.271a17.6 17.6 0 0 0 2.8-.805 42 42 0 0 0 3.08-1.314q1.658-.78 3.777-1.798 2.135-1.035 3.67-1.766a37 37 0 0 1 2.726-1.182 14.3 14.3 0 0 1 2.259-.665 11.5 11.5 0 0 1 2.266-.214q1.15 0 2.184.214 1.035.213 1.996.616.96.403 1.93.993.755.428 1.494.23a1.95 1.95 0 0 0 1.166-.854q.476-.738.295-1.61-.18-.87-1.133-1.428a15.047 15.047 0 0 0-7.932-2.233q-1.592 0-2.997.279a18 18 0 0 0-2.833.813q-1.43.533-3.096 1.322-1.666.788-3.769 1.79-2.151 1.035-3.687 1.765a40 40 0 0 1-2.701 1.183q-1.167.45-2.218.657-1.05.204-2.233.205-1.56 0-2.997-.41-1.437-.411-2.981-1.347-.756-.444-1.486-.247a1.92 1.92 0 0 0-1.142.821 2.11 2.11 0 0 0-.328 1.618q.165.879 1.133 1.453 1.117.657 2.357 1.15t2.603.764q1.363.27 2.84.27"
    ></path>
    </svg>
);

export default SvgIcon;
