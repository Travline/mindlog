import React from 'react';
import { Svg, G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const YourSvgComponent = ({ className = '', ...props }) => {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={`aspect-square w-full h-full max-w-full max-h-full self-center ${className}`}
      {...props}
    >
      <G clipPath="url(#clip0_1_708)">
        <Path
          d="M24 0H76C89.246 0 100 10.754 100 24V76C100 89.246 89.246 100 76 100H24C10.754 100 0 89.246 0 76V24C0 10.754 10.754 0 24 0V0"
          fill="black"
        />
        <Path
          d="M28 68V32L50 52L72 32V68"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="white"
        />
        <Path
          d="M46 68C46 70.2077 47.7923 72 50 72C52.2077 72 54 70.2077 54 68C54 65.7923 52.2077 64 50 64C47.7923 64 46 65.7923 46 68V68"
          fill="white"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1_708">
          <Rect width="100" height="100" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default YourSvgComponent;