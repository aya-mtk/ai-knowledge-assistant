import glowingCube from "../assets/glowingCube.png";

export function NodexLogo({ size = 32, color = "#3B82F6" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={color} strokeWidth="6" strokeLinecap="round">
        <line x1="10" y1="90" x2="10" y2="10" />
        <line x1="10" y1="10" x2="90" y2="90" />
        <line x1="90" y1="90" x2="90" y2="10" />
        <line x1="10" y1="55" x2="45" y2="75" />
      </g>

      <g fill={color}>
        <circle cx="10" cy="10" r="6" />
        <circle cx="10" cy="90" r="6" />
        <circle cx="90" cy="10" r="6" />
        <circle cx="90" cy="90" r="6" />
        <circle cx="45" cy="75" r="6" />
        <circle cx="50" cy="50" r="6" />
      </g>
    </svg>
  );
}

export function KnowledgeCube() {
  return (
    <div className="cube-frame">
      <img
        src={glowingCube}
        alt="Glowing knowledge cube"
        className="cube-img"
      />
    </div>
  );
}
