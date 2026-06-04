export default function LogoSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 120"
      className={className}
      style={style}
      aria-label="ARA by Shanaya"
    >
      {/* Left floral ornament */}
      <g transform="translate(22,60)" fill="#8B6914" opacity="0.95">
        <circle cx="0" cy="0" r="3.5"/>
        <ellipse cx="-10" cy="-4" rx="7" ry="3.5" transform="rotate(-30,-10,-4)"/>
        <ellipse cx="-10" cy="4"  rx="7" ry="3.5" transform="rotate(30,-10,4)"/>
        <ellipse cx="-18" cy="-10" rx="6" ry="2.8" transform="rotate(-55,-18,-10)"/>
        <ellipse cx="-18" cy="10"  rx="6" ry="2.8" transform="rotate(55,-18,10)"/>
        <ellipse cx="-22" cy="0"   rx="8" ry="2.5"/>
        <ellipse cx="-14" cy="-17" rx="5" ry="2.2" transform="rotate(-75,-14,-17)"/>
        <ellipse cx="-14" cy="17"  rx="5" ry="2.2" transform="rotate(75,-14,17)"/>
        <circle cx="-26" cy="-7" r="2"/>
        <circle cx="-26" cy="7"  r="2"/>
        <circle cx="-10" cy="-15" r="1.8"/>
        <circle cx="-10" cy="15"  r="1.8"/>
        <ellipse cx="-28" cy="-14" rx="4" ry="1.8" transform="rotate(-60,-28,-14)"/>
        <ellipse cx="-28" cy="14"  rx="4" ry="1.8" transform="rotate(60,-28,14)"/>
        <ellipse cx="-30" cy="0"   rx="5" ry="1.5"/>
        <circle cx="-5" cy="-22" r="1.5"/>
        <circle cx="-5" cy="22"  r="1.5"/>
        <circle cx="-32" cy="-5" r="1.2"/>
        <circle cx="-32" cy="5"  r="1.2"/>
      </g>

      {/* Right floral ornament (mirror) */}
      <g transform="translate(298,60) scale(-1,1)" fill="#8B6914" opacity="0.95">
        <circle cx="0" cy="0" r="3.5"/>
        <ellipse cx="-10" cy="-4" rx="7" ry="3.5" transform="rotate(-30,-10,-4)"/>
        <ellipse cx="-10" cy="4"  rx="7" ry="3.5" transform="rotate(30,-10,4)"/>
        <ellipse cx="-18" cy="-10" rx="6" ry="2.8" transform="rotate(-55,-18,-10)"/>
        <ellipse cx="-18" cy="10"  rx="6" ry="2.8" transform="rotate(55,-18,10)"/>
        <ellipse cx="-22" cy="0"   rx="8" ry="2.5"/>
        <ellipse cx="-14" cy="-17" rx="5" ry="2.2" transform="rotate(-75,-14,-17)"/>
        <ellipse cx="-14" cy="17"  rx="5" ry="2.2" transform="rotate(75,-14,17)"/>
        <circle cx="-26" cy="-7" r="2"/>
        <circle cx="-26" cy="7"  r="2"/>
        <circle cx="-10" cy="-15" r="1.8"/>
        <circle cx="-10" cy="15"  r="1.8"/>
        <ellipse cx="-28" cy="-14" rx="4" ry="1.8" transform="rotate(-60,-28,-14)"/>
        <ellipse cx="-28" cy="14"  rx="4" ry="1.8" transform="rotate(60,-28,14)"/>
        <ellipse cx="-30" cy="0"   rx="5" ry="1.5"/>
        <circle cx="-5" cy="-22" r="1.5"/>
        <circle cx="-5" cy="22"  r="1.5"/>
        <circle cx="-32" cy="-5" r="1.2"/>
        <circle cx="-32" cy="5"  r="1.2"/>
      </g>

      {/* ARA — inline font so it always renders */}
      <text
        x="160" y="74"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
        fontSize="58"
        fontWeight="700"
        letterSpacing="6"
        fill="#8B6914"
      >ARA</text>

      {/* by Shanaya */}
      <text
        x="160" y="99"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', 'Palatino Linotype', Palatino, Georgia, serif"
        fontSize="16"
        letterSpacing="2"
        fontStyle="italic"
        fill="#8B6914"
      >by Shanaya</text>

      {/* Decorative lines */}
      <line x1="58" y1="24" x2="262" y2="24" stroke="#8B6914" strokeWidth="0.7" opacity="0.55"/>
      <line x1="58" y1="110" x2="262" y2="110" stroke="#8B6914" strokeWidth="0.7" opacity="0.55"/>
    </svg>
  );
}
