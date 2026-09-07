import fs from "fs";
import path from "path";

const logosDir = "public/logos";
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

const lightWithBg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600" role="img" aria-labelledby="title desc">
  <title id="title">WUGAMS HOLDING INC</title>
  <desc id="desc">Embleme champagne representant un livre ouvert et la lettre W au-dessus du mot-symbole WUGAMS, sur fond blanc.</desc>
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A5A18"/>
      <stop offset="22%" stop-color="#D79A35"/>
      <stop offset="48%" stop-color="#FFE29A"/>
      <stop offset="72%" stop-color="#B97720"/>
      <stop offset="100%" stop-color="#754812"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A66C1B"/>
      <stop offset="50%" stop-color="#EABF67"/>
      <stop offset="100%" stop-color="#A66C1B"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1600" fill="#FFFFFF"/>
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
  </g>
  <g text-anchor="middle">
    <text x="800" y="960" fill="#15191E" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-size="176" font-weight="600" letter-spacing="18">WUGAMS</text>
    <text x="800" y="1068" fill="#15191E" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="52" font-weight="600" letter-spacing="22">HOLDING INC</text>
  </g>
</svg>`;

const darkWithBg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600" role="img" aria-labelledby="title desc">
  <title id="title">WUGAMS HOLDING INC</title>
  <desc id="desc">Embleme dore representant un livre ouvert et la lettre W au-dessus du mot-symbole WUGAMS, sur fond noir profond.</desc>
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .22 0" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1600" height="1600" fill="#090A0C"/>
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
  </g>
  <g text-anchor="middle">
    <text x="800" y="960" fill="#FFF0C2" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-size="176" font-weight="600" letter-spacing="18">WUGAMS</text>
    <text x="800" y="1068" fill="#F0D99C" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="52" font-weight="500" letter-spacing="22">HOLDING INC</text>
  </g>
</svg>`;

const lightTransparent = lightWithBg.replace('<rect width="1600" height="1600" fill="#FFFFFF"/>','');
const darkTransparent = darkWithBg.replace('<rect width="1600" height="1600" fill="#090A0C"/>','');

const emblemLight = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" role="img" aria-label="WUGAMS emblem">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A5A18"/>
      <stop offset="22%" stop-color="#D79A35"/>
      <stop offset="48%" stop-color="#FFE29A"/>
      <stop offset="72%" stop-color="#B97720"/>
      <stop offset="100%" stop-color="#754812"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A66C1B"/>
      <stop offset="50%" stop-color="#EABF67"/>
      <stop offset="100%" stop-color="#A66C1B"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
  </g>
</svg>`;

const emblemDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1600" role="img" aria-label="WUGAMS emblem">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .22 0" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
  </g>
</svg>`;

const emblemCropped = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="430 240 740 520" role="img" aria-label="WUGAMS emblem">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>
    </linearGradient>
    <linearGradient id="goldSoft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="18"/>
    <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="18"/>
    <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="18"/>
    <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
    <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoft)" stroke-width="8" opacity=".95"/>
  </g>
</svg>`;

const horizontalDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="240" viewBox="0 0 900 240" role="img" aria-label="WUGAMS HOLDING INC">
  <defs>
    <linearGradient id="goldH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A5A18"/>
      <stop offset="22%" stop-color="#D79A35"/>
      <stop offset="48%" stop-color="#FFE29A"/>
      <stop offset="72%" stop-color="#B97720"/>
      <stop offset="100%" stop-color="#754812"/>
    </linearGradient>
    <linearGradient id="goldSoftH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A66C1B"/>
      <stop offset="50%" stop-color="#EABF67"/>
      <stop offset="100%" stop-color="#A66C1B"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#goldH)" stroke-linecap="round" stroke-linejoin="round">
    <g transform="translate(-380, -220) scale(0.58)">
      <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="22"/>
      <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="22"/>
      <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="22"/>
      <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoftH)" stroke-width="10" opacity=".95"/>
      <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoftH)" stroke-width="10" opacity=".95"/>
    </g>
  </g>
  <g>
    <text x="260" y="102" fill="#15191E" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="10">WUGAMS</text>
    <text x="260" y="146" fill="#15191E" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="26" font-weight="600" letter-spacing="11">HOLDING INC</text>
  </g>
</svg>`;

const horizontalLight = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="240" viewBox="0 0 900 240" role="img" aria-label="WUGAMS HOLDING INC">
  <defs>
    <linearGradient id="goldH2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9A671F"/>
      <stop offset="22%" stop-color="#F4CE79"/>
      <stop offset="48%" stop-color="#FFF0B1"/>
      <stop offset="72%" stop-color="#D99A36"/>
      <stop offset="100%" stop-color="#8E5E1D"/>
    </linearGradient>
    <linearGradient id="goldSoftH2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C78A2D"/>
      <stop offset="50%" stop-color="#FFE6A0"/>
      <stop offset="100%" stop-color="#C78A2D"/>
    </linearGradient>
    <filter id="glowH" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55  0 1 0 0 0.32  0 0 1 0 0.05  0 0 0 .22 0" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g fill="none" stroke="url(#goldH2)" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowH)">
    <g transform="translate(-380, -220) scale(0.58)">
      <path d="M438 264 C548 285 640 345 684 425 C704 462 708 510 708 574 L708 724 C638 662 552 620 454 600 L454 276 Z" stroke-width="22"/>
      <path d="M1162 264 C1052 285 960 345 916 425 C896 462 892 510 892 574 L892 724 C962 662 1048 620 1146 600 L1146 276 Z" stroke-width="22"/>
      <path d="M708 426 C704 520 705 623 708 724 L760 594 L800 730 L840 594 L892 724 C895 623 896 520 892 426" stroke-width="22"/>
      <path d="M454 600 C548 620 638 662 708 724" stroke="url(#goldSoftH2)" stroke-width="10" opacity=".95"/>
      <path d="M1146 600 C1052 620 962 662 892 724" stroke="url(#goldSoftH2)" stroke-width="10" opacity=".95"/>
    </g>
  </g>
  <g>
    <text x="260" y="102" fill="#FFF0C2" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-size="88" font-weight="600" letter-spacing="10">WUGAMS</text>
    <text x="260" y="146" fill="#F0D99C" font-family="Montserrat, Arial, Helvetica, sans-serif" font-size="26" font-weight="500" letter-spacing="11">HOLDING INC</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(logosDir,'wugams-logo-dark.svg'), lightTransparent);
fs.writeFileSync(path.join(logosDir,'wugams-logo-light.svg'), darkTransparent);
fs.writeFileSync(path.join(logosDir,'wugams-logo-vertical-dark.svg'), lightTransparent);
fs.writeFileSync(path.join(logosDir,'wugams-logo-vertical-light.svg'), darkTransparent);
fs.writeFileSync(path.join(logosDir,'wugams-logo-vertical-dark-bg.svg'), lightWithBg);
fs.writeFileSync(path.join(logosDir,'wugams-logo-vertical-light-bg.svg'), darkWithBg);
fs.writeFileSync(path.join(logosDir,'wugams-emblem.svg'), emblemCropped);
fs.writeFileSync(path.join(logosDir,'wugams-emblem-light.svg'), emblemDark);
fs.writeFileSync(path.join(logosDir,'wugams-emblem-dark.svg'), emblemLight);
fs.writeFileSync(path.join(logosDir,'wugams-emblem-full-light.svg'), emblemLight);
fs.writeFileSync(path.join(logosDir,'wugams-emblem-full-dark.svg'), emblemDark);
fs.writeFileSync(path.join(logosDir,'wugams-logo-horizontal-dark.svg'), horizontalDark);
fs.writeFileSync(path.join(logosDir,'wugams-logo-horizontal-light.svg'), horizontalLight);
fs.writeFileSync('public/favicon.svg', emblemCropped);
fs.writeFileSync('public/logos/wugams-emblem-cropped.svg', emblemCropped);
console.log('logos written');
console.log(fs.readdirSync(logosDir));
