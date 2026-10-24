// Floral motif from Neo Tech V2, used only as release decoration.
export function FlowerArt() {
  return (
    <svg viewBox="0 0 440 400" fill="none" aria-hidden="true">
      <circle
        cx="225"
        cy="193"
        r="145"
        stroke="#70AB83"
        strokeOpacity=".3"
        strokeDasharray="3 12"
      />
      <path
        d="M223 351V206m0 92c-44-6-68-33-78-59 45 0 69 18 78 39m1 40c42-1 73-29 85-55-41-3-70 10-85 30"
        stroke="#71976D"
        strokeWidth="2"
      />
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d="M225 193c-35-31-42-65-16-89 13-12 28-12 38 0 26 24 13 65-22 89Z"
          fill={i % 2 ? "#285B3D" : "#366C48"}
          stroke="#8AAA7C"
          strokeOpacity=".6"
          transform={`rotate(${i * 45} 225 193)`}
        />
      ))}
      <circle cx="225" cy="193" r="21" fill="#173122" stroke="#B69A62" />
      <circle cx="225" cy="193" r="11" fill="#AAB67F" />
    </svg>
  );
}
