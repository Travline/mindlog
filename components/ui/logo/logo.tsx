// components/ui/logo.tsx
import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function MindlogLogo({
  size = 48,
  className = "",
  color = "#0d9488" // teal-600 de Tailwind CSS (#0d9488)
}: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <Defs>
        <LinearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </LinearGradient>
      </Defs>

      {/* Tarjeta 1 (Izquierda - Entrada de ideas) */}
      <Rect
        x="18"
        y="32"
        width="18"
        height="38"
        rx="9"
        fill={color}
        fillOpacity="0.2"
      />

      {/* Tarjeta 2 (Centro - Tablero Activo / Procesamiento) */}
      <Rect
        x="41"
        y="20"
        width="20"
        height="60"
        rx="10"
        fill="url(#tealGrad)"
      />

      {/* Tarjeta 3 (Derecha - Organización / Log) */}
      <Rect
        x="66"
        y="38"
        width="16"
        height="30"
        rx="8"
        fill={color}
        fillOpacity="0.35"
      />

      {/* Pulso mental / Conexión fluida */}
      <Path
        d="M 12 56 Q 27 38 41 54 T 70 48 T 88 50"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Destello de claridad */}
      <Path
        d="M 51 28 L 52.5 32.5 L 57 34 L 52.5 35.5 L 51 40 L 49.5 35.5 L 45 34 L 49.5 32.5 Z"
        fill="#FFFFFF"
      />

      {/* Nodos de pensamiento */}
      <Circle cx="27" cy="50" r="3" fill={color} />
      <Circle cx="74" cy="46" r="3" fill={color} />
    </Svg>
  );
}