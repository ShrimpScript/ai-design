// One source of truth for font judgement, shared by slop-lint, shoot and recon.
// default   = what models reach for unprompted.
// saturated = fine faces made ubiquitous by widely copied "use these instead" prompt lists
//             (e.g. the Claude cookbook's frontend-aesthetics prompt names most of them).
// novelty   = genre-cliché faces (cyber/sci-fi, pixel, party, fantasy). Only when the brief IS that genre.
export const FONT_TIERS = {
  default: ['Inter', 'Inter Tight', 'Inter Display', 'Roboto', 'Open Sans', 'Lato', 'Arial', 'Helvetica', 'Poppins', 'Montserrat', 'Space Grotesk', 'DM Sans', 'Geist', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Sora', 'Urbanist', 'Lexend', 'Nunito', 'Nunito Sans', 'Raleway', 'Work Sans', 'Mulish'],
  saturated: ['Clash Display', 'Clash Grotesk', 'Satoshi', 'Cabinet Grotesk', 'General Sans', 'Switzer', 'Bricolage Grotesque', 'Fraunces', 'Playfair Display', 'Instrument Serif', 'Syne', 'Unbounded', 'JetBrains Mono', 'Fira Code', 'Space Mono', 'IBM Plex Sans', 'IBM Plex Mono', 'IBM Plex Serif', 'Crimson Pro', 'Cormorant', 'Cormorant Garamond', 'DM Serif Display', 'Source Sans 3', 'Geist Mono', 'Figtree'],
  novelty: ['Orbitron', 'Audiowide', 'Exo', 'Exo 2', 'Rajdhani', 'Oxanium', 'Share Tech', 'Share Tech Mono', 'Michroma', 'Syncopate', 'Tektur', 'Chakra Petch', 'Aldrich', 'Electrolize', 'Iceland', 'Quantico', 'Russo One', 'Black Ops One', 'Major Mono Display', 'Press Start 2P', 'VT323', 'Silkscreen', 'Pixelify Sans', 'Monoton', 'Bungee', 'Bungee Shade', 'Nabla', 'Righteous', 'Wallpoet', 'Turret Road', 'Zen Dots', 'Goldman', 'Creepster', 'Lobster', 'Pacifico', 'Comic Sans MS', 'Comic Neue', 'Papyrus', 'Bangers', 'Luckiest Guy', 'Chewy', 'Cinzel Decorative', 'Uncial Antiqua', 'Metal Mania', 'Nosifer', 'Rubik Glitch', 'Rubik Mono One'],
};
const norm = (s) => s.toLowerCase().replace(/["']/g, '').replace(/[\s_+-]+/g, ' ').replace(/ variable$/, '').trim();
const index = new Map(Object.entries(FONT_TIERS).flatMap(([tier, list]) => list.map(f => [norm(f), tier])));
export const fontTier = (family) => index.get(norm(family)) || null;
export const tierRegex = (tier) => new RegExp(`\\b(${FONT_TIERS[tier].map(f => f.replace(/ /g, '[ +_-]?')).join('|')})\\b(?![ +_-]?(Mono|Serif|Display|Tight|Sans|Condensed))`, 'i');
