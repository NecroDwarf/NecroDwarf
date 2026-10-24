// Corridor geometry adapted from the approved Neo Tech V2 illustration, not a game screenshot.
export function ManiacArt() {
  return (
    <svg viewBox="0 0 600 400" fill="none" aria-hidden="true">
      <path fill="#111115" d="M0 0h600v400H0z" />
      <path
        fill="#251c22"
        d="m0 0 240 100v190L0 400Zm600 0L360 100v190l240 110Z"
      />
      <g stroke="#66505a" strokeOpacity=".6">
        <path d="m0 0 240 100h120L600 0M0 400l240-110h120l240 110M240 100v190m120-190v190" />
        <path d="m90 37 160 65v193L90 360Zm420 0-160 65v193l160 65ZM0 140l240 55M0 250l240 5m360-115-240 55m240 55-240 5M130 400l133-110m207 110L337 290" />
      </g>
      <path d="M264 118h72v172h-72z" fill="#090d0e" stroke="#a16f74" />
      <path d="M269 122h62v4h-62z" fill="#d69b9f" />
      <path
        d="M286 195c-5-28 32-28 28 0v17l15 23-8 55h-44l-7-55 16-23Z"
        fill="#050808"
      />
      <path d="M28 32v206m544-130v172" stroke="#b69a62" strokeOpacity=".5" />
      <path d="M270 290 120 400h360L330 290Z" fill="#754249" opacity=".12" />
      <circle cx="300" cy="124" r="3" fill="#53cfa1" />
    </svg>
  );
}
