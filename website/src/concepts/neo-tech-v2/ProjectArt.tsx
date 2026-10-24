import { useId } from "react";
import s from "./NeoTechV2.module.css";

export function ManiacArt() {
  const id = `m${useId().replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 800 500"
      fill="none"
      aria-hidden="true"
      className={s.maniacArt}
    >
      <defs>
        <linearGradient
          id={`${id}-hall`}
          x1="400"
          y1="80"
          x2="400"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B211B" />
          <stop offset="1" stopColor="#050C0B" />
        </linearGradient>
        <radialGradient id={`${id}-mist`}>
          <stop stopColor="#246C53" stopOpacity=".6" />
          <stop offset="1" stopColor="#0D211B" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`${id}-door`}
          x1="400"
          y1="90"
          x2="400"
          y2="335"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#28583F" />
          <stop offset="1" stopColor="#0B1913" />
        </linearGradient>
      </defs>
      <path d="M0 0h800v500H0Z" fill={`url(#${id}-hall)`} />
      <path
        d="m0 0 310 120v230L0 500Zm800 0L490 120v230l310 150Z"
        fill="#101F1B"
      />
      <g stroke="#3A5141" strokeOpacity=".65">
        <path d="m0 0 310 120h180L800 0M0 500l310-150h180l310 150M310 120v230m180-230v230" />
        <path d="m118 46 235 87v225L118 445ZM682 46l-235 87v225l235 87Z" />
        <path d="m217 84 98 37v232l-98 46ZM583 84l-98 37v232l98 46Z" />
        <path d="M0 98l310 84m-310 0 310 55M0 300l310-10M800 98l-310 84m310 0-310 55m310 63-310-10M80 500l255-150m385 150L465 350M250 500l110-150m190 150L440 350" />
      </g>
      <path
        d="M349 141h102v209H349Z"
        fill="#040B08"
        stroke="#5A7259"
        strokeWidth="2"
      />
      <path d="M358 149h84v199h-84Z" fill={`url(#${id}-door)`} />
      <path d="M355 146h90v6h-90Z" fill="#53CFA1" opacity=".6" />
      <path
        d="M368 225c0-19 11-34 26-34s25 15 25 34v13l21 37-10 77h-65l-8-77 11-36Z"
        fill="#030A07"
      />
      <path d="m409 271 17 70m-42-68-11 68" stroke="#15291C" strokeWidth="3" />
      <path d="M30 28h7v290h-7Zm731 0h7v290h-7Z" fill="#4A6654" />
      <path
        d="M34 39v116m731-68v100"
        stroke="#A08C6B"
        strokeWidth="3"
        opacity=".65"
      />
      <ellipse cx="403" cy="330" rx="300" ry="190" fill={`url(#${id}-mist)`} />
      <path
        d="m572 65-20 86 14 38-36 61"
        stroke="#66806A"
        strokeWidth="1"
        opacity=".5"
      />
      <g fill="#7DBD98" opacity=".35">
        <circle cx="280" cy="212" r="1.5" />
        <circle cx="531" cy="304" r="1" />
        <circle cx="344" cy="368" r="2" />
        <circle cx="459" cy="94" r="1" />
      </g>
    </svg>
  );
}

export function FriendSheepArt() {
  return (
    <div className={s.friendsArt} aria-hidden="true">
      <svg viewBox="0 0 540 360" fill="none">
        <g stroke="#90A98F" strokeOpacity=".35">
          <circle cx="267" cy="177" r="115" strokeDasharray="3 9" />
          <circle cx="267" cy="177" r="145" />
          <path d="m171 100 85 54 91-72M254 180l97 88-200-8Z" />
        </g>
        <g transform="rotate(-10 156 127)">
          <rect
            x="66"
            y="58"
            width="180"
            height="110"
            rx="13"
            fill="#263E30"
            stroke="#799E76"
            strokeOpacity=".55"
          />
          <rect x="79" y="70" width="32" height="32" rx="9" fill="#AEBE91" />
          <path d="m87 86 5-4 5 4-5 5Z" stroke="#243C2C" strokeWidth="2" />
          <text x="79" y="129" fill="#D7DFBE" fontFamily="Arial" fontSize="16">
            Игровой вечер
          </text>
          <path d="M80 145h95" stroke="#829779" />
        </g>
        <g transform="rotate(11 355 122)">
          <rect
            x="293"
            y="53"
            width="178"
            height="118"
            rx="13"
            fill="#B7C599"
          />
          <rect x="308" y="68" width="32" height="30" rx="8" fill="#4E6948" />
          <path d="m318 76 13 7-13 7Z" fill="#D7DFBE" />
          <text x="308" y="125" fill="#233C2C" fontFamily="Arial" fontSize="17">
            Киновечер
          </text>
          <path d="M309 144h78" stroke="#5B7350" />
        </g>
        <g transform="rotate(-4 277 262)">
          <rect
            x="163"
            y="218"
            width="224"
            height="89"
            rx="13"
            fill="#1B3227"
            stroke="#779471"
          />
          <circle cx="189" cy="247" r="10" fill="#5B8160" />
          <circle cx="213" cy="247" r="10" fill="#B6BC8F" />
          <circle cx="237" cy="247" r="10" fill="#879E78" />
          <text x="181" y="284" fill="#D7DFBE" fontFamily="Arial" fontSize="15">
            Встреча друзей
          </text>
          <path d="m354 261 8 8-8 8m-11-8h18" stroke="#A3BB8F" />
        </g>
        <circle cx="267" cy="177" r="35" fill="#00A86B" stroke="#89C7A6" />
        <path
          d="M250 188c-12-2-11-19 1-20-2-12 14-17 21-6 11-6 22 6 16 16 8 12-7 22-16 14h-17Zm7 3v8m19-7v7m-1-23 10 2-3 10-9-2"
          stroke="#D8E6C7"
          strokeWidth="2"
        />
        <g fill="#C5C997">
          <circle cx="109" cy="232" r="4" />
          <circle cx="417" cy="211" r="5" />
          <circle cx="252" cy="35" r="3" />
        </g>
      </svg>
    </div>
  );
}

export function KingdomArt() {
  return (
    <svg
      className={s.kingdomArt}
      viewBox="0 0 600 370"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m70 256 230-115 230 115-230 114Z"
        fill="#101C15"
        stroke="#576044"
      />
      <path
        d="m98 250 202-101 202 101-202 100Z"
        fill="#2A3824"
        stroke="#5E6F47"
      />
      <g stroke="#87966A" strokeOpacity=".25">
        <path d="m150 225 202 100m-149-127 201 102m-149-128 201 102M150 276l202-101M202 302l202-101M254 328l202-101" />
      </g>
      <path
        d="m190 216 110-55 110 55v32l-110 55-110-55Z"
        fill="#3F4B30"
        stroke="#98A26B"
        strokeOpacity=".5"
      />
      <path d="m190 216 110 55 110-55m-110 55v32" stroke="#7B8655" />
      <path
        d="m236 202 64-32 64 32v43l-64 32-64-32Z"
        fill="#263D28"
        stroke="#8D9E68"
      />
      <path
        d="M236 202v-57l22-11 21 11v56m42 0v-56l21-11 22 11v57"
        fill="#4F6040"
        stroke="#A7AF7A"
      />
      <path
        d="m236 145 21 11 22-11m-22 11v64m64-75 21 11 22-11m-22 11v64"
        stroke="#263A27"
      />
      <path d="M277 219V116l23-12 23 12v103" fill="#455C3B" stroke="#AFB87D" />
      <path
        d="m277 116 23 12 23-12m-23 12v103M300 104V61l43 13-43 16"
        stroke="#B69A62"
        strokeWidth="2"
      />
      <path d="m302 63 39 12-39 12Z" fill="#00A86B" />
      <path d="M288 263v-22q12-22 24-12v28" fill="#07170E" stroke="#83925C" />
      <path
        d="m248 177 9 4v15l-9-4Zm83 4 9-4v15l-9 4Zm-37-30 10 1v17l-10-1Z"
        fill="#90B778"
      />
      <path
        d="m154 249 46 23 35-17m111 55 36-18 37 17"
        stroke="#B69A62"
        strokeWidth="2"
        strokeDasharray="3 6"
      />
      <g fill="#00A86B">
        <circle cx="154" cy="249" r="4" />
        <circle cx="419" cy="309" r="4" />
      </g>
      <path d="M408 85h58v32h-17l-12 12v-12h-29Z" stroke="#6B8060" />
      <path d="M419 96h35m-35 10h23" stroke="#86966D" />
    </svg>
  );
}

export function DiceArt() {
  const id = `d${useId().replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      className={s.diceArt}
      viewBox="0 0 650 390"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-face`}
          x1="260"
          y1="60"
          x2="421"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#406C53" />
          <stop offset="1" stopColor="#0B2A1C" />
        </linearGradient>
      </defs>
      <g
        transform="translate(40 230) rotate(-27) scale(1 .55)"
        stroke="#4B7555"
        strokeOpacity=".4"
      >
        <path d="M0 0h480v240H0Z" />
        <path d="M0 60h480M0 120h480M0 180h480M60 0v240m60-240v240m60-240v240m60-240v240m60-240v240m60-240v240m60-240v240" />
        <path
          d="M180 60h60v60h-60Zm120 60h60v60h-60Z"
          fill="#00A86B"
          fillOpacity=".24"
        />
      </g>
      <ellipse
        cx="343"
        cy="301"
        rx="115"
        ry="25"
        fill="#020B06"
        opacity=".55"
      />
      <g transform="rotate(13 335 185)">
        <path
          d="m335 48 106 60 9 124-115 70-106-62-8-124Z"
          fill={`url(#${id}-face)`}
          stroke="#A3BF91"
          strokeWidth="1.5"
        />
        <path
          d="m335 48-52 88 102-3Zm-114 68 62 20-54 104Zm220-8-56 25 65 99Zm-212 132 54-104 52 166 50-169 65 99m-167-96 102-3m-156 107 106 62 115-70M335 48l-114 68m114-68 106 60"
          stroke="#7FA47B"
          strokeWidth="1.2"
        />
        <text
          x="332"
          y="205"
          fill="#D6DEC2"
          fontFamily="Georgia"
          fontSize="48"
          textAnchor="middle"
        >
          20
        </text>
        <text
          x="335"
          y="111"
          fill="#A5C294"
          fontFamily="Georgia"
          fontSize="17"
          textAnchor="middle"
        >
          8
        </text>
        <text
          x="415"
          y="205"
          fill="#8DA981"
          fontFamily="Georgia"
          fontSize="21"
          transform="rotate(-15 415 205)"
        >
          12
        </text>
      </g>
      <g transform="rotate(-18 174 236)">
        <path
          d="m173 179 49 25v56l-49 27-49-27v-56Z"
          fill="#2C4430"
          stroke="#9AAE83"
        />
        <path d="m124 204 49 27 49-27m-49 27v56" stroke="#9AAE83" />
        <g fill="#CFD6B3">
          <circle cx="147" cy="242" r="4" />
          <circle cx="195" cy="238" r="4" />
          <circle cx="195" cy="258" r="4" />
          <circle cx="173" cy="205" r="4" />
        </g>
      </g>
      <path
        d="M493 104h35m-17-17v35M116 143h18m-9-9v18"
        stroke="#B69A62"
        opacity=".7"
      />
      <path d="m482 265 38-21 39 22-39 22Z" fill="#176B50" stroke="#659569" />
      <path d="m520 244 39 22-39 22" stroke="#9CB588" />
    </svg>
  );
}

export function FlowerArt() {
  return (
    <svg
      className={s.flowerArt}
      viewBox="0 0 440 400"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="225" cy="193" r="125" stroke="#70AB83" strokeOpacity=".22" />
      <circle
        cx="225"
        cy="193"
        r="145"
        stroke="#70AB83"
        strokeOpacity=".15"
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
      <path d="m85 300 17 8m237-204 16-6M115 99l-9-13" stroke="#B69A62" />
    </svg>
  );
}
