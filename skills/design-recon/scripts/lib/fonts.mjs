// One source of truth for font judgement, shared by slop-lint, shoot and recon.
// default   = what models reach for unprompted.
// saturated = fine faces made ubiquitous by widely copied "use these instead" prompt lists
//             (e.g. the Claude cookbook's frontend-aesthetics prompt names most of them).
// novelty   = genre-cliché faces (cyber/sci-fi, pixel, party, fantasy). Only when the brief IS that genre.
export const FONT_TIERS = {
  default: ['Inter', 'Inter Tight', 'Inter Display', 'Roboto', 'Open Sans', 'Lato', 'Arial', 'Helvetica', 'Poppins', 'Montserrat', 'Space Grotesk', 'DM Sans', 'Geist', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Sora', 'Urbanist', 'Lexend', 'Nunito', 'Nunito Sans', 'Raleway', 'Work Sans', 'Mulish'],
  saturated: ['Clash Display', 'Clash Grotesk', 'Satoshi', 'Cabinet Grotesk', 'General Sans', 'Switzer', 'Bricolage Grotesque', 'Fraunces', 'Playfair Display', 'Instrument Serif', 'Syne', 'Unbounded', 'JetBrains Mono', 'Fira Code', 'Space Mono', 'IBM Plex Sans', 'IBM Plex Mono', 'IBM Plex Serif', 'Crimson Pro', 'Cormorant', 'Cormorant Garamond', 'DM Serif Display', 'Source Sans 3', 'Geist Mono', 'Figtree'],
  condensed: ['Oswald', 'Bebas Neue', 'Anton', 'Barlow Condensed', 'Barlow Semi Condensed', 'Roboto Condensed', 'Archivo Narrow', 'Big Shoulders', 'Big Shoulders Display', 'Sofia Sans Condensed', 'Sofia Sans Extra Condensed', 'Fjalla One', 'Pathway Gothic One', 'League Gothic', 'Antonio', 'Teko', 'Saira Condensed', 'Saira Extra Condensed', 'IBM Plex Sans Condensed', 'Encode Sans Condensed', 'Open Sans Condensed', 'Yanone Kaffeesatz', 'PT Sans Narrow', 'Khand', 'Six Caps', 'Smooch Sans', 'Mohave', 'Stint Ultra Condensed', 'Alumni Sans'],
  novelty: ['Orbitron', 'Audiowide', 'Exo', 'Exo 2', 'Rajdhani', 'Oxanium', 'Share Tech', 'Share Tech Mono', 'Michroma', 'Syncopate', 'Tektur', 'Chakra Petch', 'Aldrich', 'Electrolize', 'Iceland', 'Quantico', 'Russo One', 'Black Ops One', 'Major Mono Display', 'Press Start 2P', 'VT323', 'Silkscreen', 'Pixelify Sans', 'Monoton', 'Bungee', 'Bungee Shade', 'Nabla', 'Righteous', 'Wallpoet', 'Turret Road', 'Zen Dots', 'Goldman', 'Creepster', 'Lobster', 'Pacifico', 'Comic Sans MS', 'Comic Neue', 'Papyrus', 'Bangers', 'Luckiest Guy', 'Chewy', 'Cinzel Decorative', 'Uncial Antiqua', 'Metal Mania', 'Nosifer', 'Rubik Glitch', 'Rubik Mono One'],
};
// Preferred by default (house taste, editable): round, open, regular-width faces that read well at weight ≥ 400.
// Includes Google's own Sans families as the first fallback.
export const ROUND = ['Google Sans Flex', 'Google Sans', 'Parkinsans', 'Gabarito', 'Rubik', 'Readex Pro', 'Varela Round', 'M PLUS Rounded 1c', 'Zen Maru Gothic', 'Red Hat Display', 'Red Hat Text', 'Be Vietnam Pro', 'Commissioner', 'Kumbh Sans', 'Afacad', 'SUSE', 'Onest', 'Albert Sans', 'Golos Text', 'Wix Madefor Display', 'Wix Madefor Text', 'Rethink Sans', 'Funnel Sans', 'Funnel Display', 'Jost', 'League Spartan'];
const norm = (s) => s.toLowerCase().replace(/["']/g, '').replace(/[\s_+-]+/g, ' ').replace(/ variable$/, '').trim();
const index = new Map(Object.entries(FONT_TIERS).flatMap(([tier, list]) => list.map(f => [norm(f), tier])));
export const fontTier = (family) => index.get(norm(family)) || null;
export const isRound = (family) => ROUND.some(f => norm(f) === norm(family));
export const tierRegex = (tier) => new RegExp(`\\b(${FONT_TIERS[tier].map(f => f.replace(/ /g, '[ +_-]?')).join('|')})\\b(?![ +_-]?(Mono|Serif|Display|Tight|Sans|Condensed))`, 'i');
