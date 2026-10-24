import { useId } from "react";

/** Conceptual ND device: machined housing, engraved monogram, jade channels. */
export function Emblem({ className }: { className?: string }) {
  const id = `nd${useId().replace(/[^a-z0-9]/gi, "")}`;
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      className={className}
      viewBox="0 0 720 600"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-rim`}
          x1="170"
          y1="100"
          x2="560"
          y2="480"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#68796D" />
          <stop offset=".25" stopColor="#263A31" />
          <stop offset=".5" stopColor="#12221C" />
          <stop offset=".74" stopColor="#465A4B" />
          <stop offset="1" stopColor="#0B1712" />
        </linearGradient>
        <linearGradient
          id={`${id}-metal`}
          x1="240"
          y1="120"
          x2="470"
          y2="460"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2C4036" />
          <stop offset=".4" stopColor="#111F19" />
          <stop offset=".8" stopColor="#152A20" />
          <stop offset="1" stopColor="#334D3D" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="160"
          y1="100"
          x2="550"
          y2="480"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B69A62" />
          <stop offset=".4" stopColor="#445744" />
          <stop offset="1" stopColor="#B69A62" stopOpacity=".25" />
        </linearGradient>
        <linearGradient
          id={`${id}-jade`}
          x1="250"
          y1="230"
          x2="450"
          y2="370"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#76D7AD" />
          <stop offset=".45" stopColor="#00A86B" />
          <stop offset="1" stopColor="#298C64" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop stopColor="#00A86B" stopOpacity=".22" />
          <stop offset="1" stopColor="#00A86B" stopOpacity="0" />
        </radialGradient>
        <filter
          id={`${id}-shadow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="210%"
        >
          <feDropShadow
            dx="0"
            dy="30"
            stdDeviation="22"
            floodColor="#000"
            floodOpacity=".65"
          />
        </filter>
        <filter id={`${id}-light`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <pattern
          id={`${id}-grain`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 .5h7" stroke="#C3D7C4" strokeOpacity=".035" />
        </pattern>
      </defs>
      <ellipse cx="360" cy="345" rx="330" ry="235" fill={paint("halo")} />
      <g stroke="#42604D" strokeWidth=".7" opacity=".55">
        <ellipse
          cx="360"
          cy="300"
          rx="280"
          ry="245"
          transform="rotate(-16 360 300)"
        />
        <ellipse
          cx="360"
          cy="300"
          rx="295"
          ry="258"
          transform="rotate(-16 360 300)"
          strokeDasharray="2 15"
        />
        <path d="M24 300h100m472 0h100M360 18v50m0 464v50" />
      </g>
      <g transform="rotate(-13 360 300)">
        {Array.from({ length: 32 }, (_, i) => (
          <path
            key={i}
            d="M360 43v9"
            stroke={i % 4 === 0 ? "#B69A62" : "#56725E"}
            strokeWidth={i % 4 === 0 ? 2 : 1}
            transform={`rotate(${i * 11.25} 360 300)`}
            opacity=".65"
          />
        ))}
      </g>
      <g transform="rotate(-13 360 300)" filter={paint("shadow")}>
        <path
          d="M247 110h226l91 91v211l-91 91H247l-91-91V201Z"
          fill="#07110C"
          stroke="#294033"
          strokeWidth="2"
        />
        <path
          d="M247 92h226l91 91v211l-91 91H247l-91-91V183Z"
          fill={paint("rim")}
          stroke="#65765E"
        />
        <path
          d="M255 109h210l82 82v195l-82 82H255l-82-82V191Z"
          fill={paint("metal")}
          stroke={paint("edge")}
        />
        <path
          d="M255 109h210l82 82M173 191l82-82"
          stroke="#B3BDA1"
          strokeOpacity=".45"
        />
        <path
          d="M273 139h174l69 69v157l-69 69H273l-69-69V208Z"
          fill="#08150F"
          stroke="#07100B"
          strokeWidth="9"
        />
        <path
          d="M273 139h174l69 69v157l-69 69H273l-69-69V208Z"
          fill={paint("grain")}
          stroke="#50705A"
          strokeWidth="1"
        />
        <path
          d="M287 157h146l65 65v129l-65 65H287l-65-65V222Z"
          stroke="#1A3C2B"
          strokeWidth="1"
        />
        <g
          stroke="#00A86B"
          strokeWidth="3"
          opacity=".5"
          filter={paint("light")}
        >
          <path d="M204 258v-50l69-69h65m178 174v52l-69 69h-64" />
          <path
            d="M258 354V225l68 129V225m30 0h41l42 42v45l-42 42h-41Z"
            strokeWidth="15"
          />
        </g>
        <path
          d="M204 258v-50l69-69h65m178 174v52l-69 69h-64"
          stroke="#00A86B"
          strokeWidth="2"
        />
        <path
          d="M257 358V222l70 136V222m30 0h42l43 43v50l-43 43h-42Z"
          stroke="#010A05"
          strokeWidth="24"
          strokeLinejoin="bevel"
        />
        <path
          d="M257 354V218l70 136V218m30 0h42l43 43v50l-43 43h-42Z"
          stroke={paint("jade")}
          strokeWidth="14"
          strokeLinejoin="bevel"
        />
        <path
          d="M250 239v-23m70 23v-23m30 23v-23h45l42 43"
          stroke="#C8E1C6"
          strokeOpacity=".6"
          strokeWidth="1"
        />
        <path d="M306 390h108m-91 5h74" stroke="#B69A62" strokeOpacity=".6" />
        <path d="M296 182h128" stroke="#233F2D" />
        <g fill="#B69A62" opacity=".6">
          <circle cx="294" cy="182" r="2" />
          <circle cx="426" cy="182" r="2" />
        </g>
        {[
          [234, 167],
          [486, 167],
          [486, 410],
          [234, 410],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="9" fill="#07110C" stroke="#495A46" />
            <circle cx={x} cy={y} r="5" fill="#26372B" />
            <path
              d={`M${x - 3} ${y + 3}l6-6`}
              stroke="#88917B"
              strokeWidth="1.5"
            />
          </g>
        ))}
        <g stroke="#B69A62" strokeWidth="1" opacity=".6">
          <path d="M302 119h19m-13-4v8m70 332h24m-18-4v8M185 285v22m-4-16h8m244-5v22" />
        </g>
        <path
          d="M181 345v38l31 31m290-272 32 32v30"
          stroke="#B69A62"
          strokeWidth="3"
        />
        <path d="M247 485v18m226-18v18m91-109v18m-408-18v18" stroke="#3F5140" />
        <text
          x="360"
          y="453"
          textAnchor="middle"
          fill="#879B81"
          fontFamily="monospace"
          fontSize="7"
          letterSpacing="3"
        >
          NECRODWARF / JADE CORE
        </text>
      </g>
      <g stroke="#B69A62" strokeWidth="1" opacity=".5">
        <path d="M74 401h72l37-37m340-173 42-42h80" />
        <circle cx="74" cy="401" r="3" />
        <circle cx="645" cy="149" r="3" />
      </g>
    </svg>
  );
}
