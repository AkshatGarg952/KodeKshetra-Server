// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         'void-black': '#000000',
//         'deep-black': '#0D0D0D',
//         'charcoal': '#1A1A1A',
//         'dark-gray': '#2A2A2A',
//         'blood-red': '#CC0000',
//         'crimson-red': '#DC143C',
//         'neon-red': '#FF0040',
//         'bright-red': '#FF1A1A',
//         'dark-red': '#8B0000',
//         'electric-blue': '#00BFFF',
//         'cyber-cyan': '#00FFFF',
//         'neon-green': '#00FF41',
//         'matrix-green': '#39FF14',
//         'gold-yellow': '#FFD700',
//         'orange-flame': '#FF4500',
//         'purple-void': '#8A2BE2',
//         'electric-purple': '#9932CC',
//         'steel-gray': '#708090',
//         'silver': '#C0C0C0',
//         'white': '#FFFFFF',
//         'crimson-glow': '#DC143C',
//         'azure-glow': '#007FFF',
//         'emerald-glow': '#50C878',
//         'violet-glow': '#8A2BE2',
//         'amber-glow': '#FFBF00',
//         'text-primary': '#FFFFFF',
//         'text-secondary': '#C0C0C0',
//         'text-muted': '#808080',
//       },
//       fontFamily: {
//         'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
//         'jetbrains-mono': ['"JetBrains Mono"', 'monospace'],
//         inter: ['Inter', 'sans-serif'],
//       },
//       backgroundImage: {
//         'gradient-fire': 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
//         'gradient-cyber': 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
//         'gradient-void': 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
//         'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #00FF41 50%, #00FFFF 100%)',
//         'gradient-plasma': 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',
//       },
//     },
//   },
//   plugins: [],
// };


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // First config
//         'void-black': '#000000',
//         'deep-black': '#0D0D0D',
//         'charcoal': '#1A1A1A',
//         'dark-gray': '#2A2A2A',
//         'blood-red': '#CC0000',
//         'crimson-red': '#DC143C',
//         'neon-red': '#FF0040',
//         'bright-red': '#FF1A1A',
//         'dark-red': '#8B0000',
//         'electric-blue': '#00BFFF',
//         'cyber-cyan': '#00FFFF',
//         'neon-green': '#00FF41',
//         'matrix-green': '#39FF14',
//         'gold-yellow': '#FFD700',
//         'orange-flame': '#FF4500',
//         'purple-void': '#8A2BE2',
//         'electric-purple': '#9932CC',
//         'steel-gray': '#708090',
//         'silver': '#C0C0C0',
//         'white': '#FFFFFF',
//         'crimson-glow': '#DC143C',
//         'azure-glow': '#007FFF',
//         'emerald-glow': '#50C878',
//         'violet-glow': '#8A2BE2',
//         'amber-glow': '#FFBF00',
//         'text-primary': '#FFFFFF',
//         'text-secondary': '#C0C0C0',
//         'text-muted': '#808080',

//         // Second config
//         'slate-gray': '#1E293B',
//         'steel-blue': '#334155',
//         'rank-gold': '#FFD700',
//         'rank-silver': '#94A3B8',
//         'rank-bronze': '#CD7F32',
//         'champion-purple': '#7C3AED',
//         'battle-crimson': '#EF4444',
//         'victory-emerald': '#10B981',
//         'streak-orange': '#F97316',
//         'electric-cyan': '#06B6D4',
//         'neon-blue': '#3B82F6',
//         'matrix-green-alt': '#22C55E', // renamed to avoid clash
//         'plasma-pink': '#EC4899',
//         'digital-yellow': '#FACC15',
//         'text-secondary-alt': '#CBD5E1',
//         'text-muted-alt': '#64748B',
//         'text-accent': '#06B6D4',
//       },
//       fontFamily: {
//         space: ['"Space Grotesk"', 'sans-serif'],
//         'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
//         'jetbrains-mono': ['"JetBrains Mono"', 'monospace'],
//         inter: ['Inter', 'sans-serif'],
//       },
//       backgroundImage: {
//         // First config
//         'gradient-fire': 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
//         'gradient-cyber': 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
//         'gradient-void': 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
//         'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #00FF41 50%, #00FFFF 100%)',
//         'gradient-plasma': 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',

//         // Second config
//         'gradient-leaderboard': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
//         'gradient-champion': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
//         'gradient-victory': 'linear-gradient(135deg, #10B981 0%, #22C55E 50%, #06B6D4 100%)',
//         'gradient-battle': 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #F59E0B 100%)',
//       },
//       animation: {
//         'nav-slide': 'navSlide 1s ease forwards',
//         'logo-glow': 'logoGlow 4s ease-in-out infinite',
//         'title-glow': 'titleGlow 3s ease-in-out infinite',
//         'pattern-move': 'patternMove 25s linear infinite',
//         'entry-slide': 'entrySlideIn 0.6s ease forwards',
//         'crown-float': 'crownFloat 2s ease-in-out infinite',
//         'avatar-spin': 'avatarSpin 3s linear infinite',
//         'fire-flicker': 'fireFlicker 1.5s ease-in-out infinite',
//         'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
//         'skeleton-shimmer': 'skeletonShimmer 1.5s ease-in-out infinite',
//         lightning: 'lightning 0.6s ease-out',
//       },
//       keyframes: {
//         navSlide: { to: { transform: 'translateY(0)' } },
//         logoGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 10px #06B6D4)' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.3) drop-shadow(0 0 20px #EC4899)' },
//         },
//         titleGlow: {
//           '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))' },
//           '50%': { filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.7))' },
//         },
//         patternMove: {
//           '0%': { transform: 'translate(0, 0)' },
//           '100%': { transform: 'translate(120px, 80px)' },
//         },
//         entrySlideIn: { to: { opacity: '1', transform: 'translateY(0)' } },
//         crownFloat: {
//           '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
//           '50%': { transform: 'translateY(-3px) rotate(5deg)' },
//         },
//         avatarSpin: {
//           '0%': { transform: 'rotate(0deg)' },
//           '100%': { transform: 'rotate(360deg)' },
//         },
//         fireFlicker: {
//           '0%, 100%': { transform: 'scale(1)', opacity: '1' },
//           '50%': { transform: 'scale(1.1)', opacity: '0.8' },
//         },
//         skeletonPulse: {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.7' },
//         },
//         skeletonShimmer: {
//           '0%': { backgroundPosition: '-200px 0' },
//           '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
//         },
//         lightning: {
//           '0%': { left: '-100%', opacity: '0' },
//           '20%': { opacity: '0.8' },
//           '100%': { left: '100%', opacity: '0' },
//         },
//       },
//     },
//   },
//   plugins: [],
// };


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}"
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Shared / First Config
//         'void-black': '#000000',
//         'deep-black': '#0D0D0D',
//         'charcoal': '#1A1A1A',
//         'dark-gray': '#2A2A2A',
//         'blood-red': '#CC0000',
//         'crimson-red': '#DC143C',
//         'neon-red': '#FF0040',
//         'bright-red': '#FF1A1A',
//         'dark-red': '#8B0000',
//         'electric-blue': '#00BFFF',
//         'cyber-cyan': '#00FFFF',
//         'neon-green': '#00FF41',
//         'matrix-green': '#39FF14',
//         'gold-yellow': '#FFD700',
//         'orange-flame': '#FF4500',
//         'purple-void': '#8A2BE2',
//         'electric-purple': '#9932CC', // unified with second config
//         'steel-gray': '#708090',
//         'silver': '#C0C0C0',
//         'white': '#FFFFFF',
//         'crimson-glow': '#DC143C',
//         'azure-glow': '#007FFF',
//         'emerald-glow': '#50C878',
//         'violet-glow': '#8A2BE2',
//         'amber-glow': '#FFBF00',

//         // Text variants
//         'text-primary': '#FFFFFF',
//         'text-secondary': '#C0C0C0',
//         'text-muted': '#808080',
//         'text-secondary-alt': '#CBD5E1',
//         'text-muted-alt': '#64748B',
//         'text-accent': '#06B6D4', // unified

//         // Leaderboard / Rank colors
//         'slate-gray': '#1E293B',
//         'steel-blue': '#334155',
//         'rank-gold': '#FFD700',
//         'rank-silver': '#94A3B8',
//         'rank-bronze': '#CD7F32',
//         'champion-purple': '#7C3AED',
//         'battle-crimson': '#EF4444',
//         'victory-emerald': '#10B981',
//         'streak-orange': '#F97316',
//         'electric-cyan': '#06B6D4',
//         'neon-blue': '#3B82F6',
//         'matrix-green-alt': '#22C55E',
//         'plasma-pink': '#EC4899',
//         'digital-yellow': '#FACC15',

//         // From second config (extra)
//         'neon-cyan': '#00F5FF',
//         'matrix-lime': '#32CD32',
//         'golden-amber': '#FFB000',
//         'flame-red': '#FF4500',
//         'ice-blue': '#87CEEB',
//         'royal-purple': '#6A0DAD',
//       },
//       fontFamily: {
//         space: ['"Space Grotesk"', 'sans-serif'],
//         'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
//         'jetbrains-mono': ['"JetBrains Mono"', 'monospace'],
//         jetbrains: ['"JetBrains Mono"', 'monospace'],
//         inter: ['Inter', 'sans-serif'],
//       },
//       backgroundImage: {
//         // First config
//         'gradient-fire': 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
//         'gradient-cyber': 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
//         'gradient-void': 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
//         'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #00FF41 50%, #00FFFF 100%)',
//         'gradient-plasma': 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',

//         // Leaderboard gradients
//         'gradient-leaderboard': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
//         'gradient-champion': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
//         'gradient-victory': 'linear-gradient(135deg, #10B981 0%, #22C55E 50%, #06B6D4 100%)',
//         'gradient-battle': 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #F59E0B 100%)',

//         // Second config extras
//         'gradient-dashboard': 'linear-gradient(135deg, #8B00FF 0%, #00F5FF 50%, #32CD32 100%)',
//         'gradient-profile': 'linear-gradient(135deg, #FFB000 0%, #FF4500 50%, #8B00FF 100%)',
//         'gradient-stats': 'linear-gradient(135deg, #00F5FF 0%, #32CD32 50%, #FFB000 100%)',
//         'gradient-fire-alt': 'linear-gradient(135deg, #FF4500 0%, #FFB000 50%, #FF6347 100%)',
//         'gradient-logo-code': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
//         'gradient-logo-versus': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
//       },
//       animation: {
//         // Shared animations
//         'nav-slide': 'navSlide 1s ease forwards',
//         'logo-glow': 'logoGlow 4s ease-in-out infinite',
//         'title-glow': 'titleGlow 3s ease-in-out infinite',
//         'pattern-move': 'patternMove 25s linear infinite',
//         'entry-slide': 'entrySlideIn 0.6s ease forwards',
//         'crown-float': 'crownFloat 2s ease-in-out infinite',
//         'avatar-spin': 'avatarSpin 3s linear infinite',
//         'fire-flicker': 'fireFlicker 1.5s ease-in-out infinite',
//         'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
//         'skeleton-shimmer': 'skeletonShimmer 1.5s ease-in-out infinite',
//         lightning: 'lightning 0.6s ease-out',

//         // Second config extras
//         logoCodeGlow: 'logoCodeGlow 4s ease-in-out infinite',
//         logoVersusGlow: 'logoVersusGlow 4s ease-in-out infinite 0.5s',
//         avatarPulse: 'avatarPulse 3s ease-in-out infinite',
//         badgeFloat: 'badgeFloat 2s ease-in-out infinite',
//         usernamePulse: 'usernamePulse 3s ease-in-out infinite',
//         streakPulse: 'streakPulse 2s ease-in-out infinite',
//         profileMove: 'profileMove 25s linear infinite',
//       },
//       keyframes: {
//         navSlide: { to: { transform: 'translateY(0)' } },
//         logoGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 10px #06B6D4)' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.3) drop-shadow(0 0 20px #EC4899)' },
//         },
//         titleGlow: {
//           '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))' },
//           '50%': { filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.7))' },
//         },
//         patternMove: {
//           '0%': { transform: 'translate(0, 0)' },
//           '100%': { transform: 'translate(120px, 80px)' },
//         },
//         entrySlideIn: { to: { opacity: '1', transform: 'translateY(0)' } },
//         crownFloat: {
//           '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
//           '50%': { transform: 'translateY(-3px) rotate(5deg)' },
//         },
//         avatarSpin: {
//           '0%': { transform: 'rotate(0deg)' },
//           '100%': { transform: 'rotate(360deg)' },
//         },
//         fireFlicker: {
//           '0%, 100%': { transform: 'scale(1)', opacity: '1' },
//           '50%': { transform: 'scale(1.1)', opacity: '0.8' },
//         },
//         skeletonPulse: {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.7' },
//         },
//         skeletonShimmer: {
//           '0%': { backgroundPosition: '-200px 0' },
//           '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
//         },
//         lightning: {
//           '0%': { left: '-100%', opacity: '0' },
//           '20%': { opacity: '0.8' },
//           '100%': { left: '100%', opacity: '0' },
//         },

//         // Extra keyframes from second config
//         logoCodeGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))' },
//         },
//         logoVersusGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(236, 72, 153, 0.7))' },
//         },
//         avatarPulse: {
//           '0%, 100%': { boxShadow: '0 0 40px rgba(255, 176, 0, 0.4)', transform: 'scale(1)' },
//           '50%': { boxShadow: '0 0 60px rgba(255, 176, 0, 0.6)', transform: 'scale(1.05)' },
//         },
//         badgeFloat: {
//           '0%, 100%': { transform: 'translateY(0)' },
//           '50%': { transform: 'translateY(-3px)' },
//         },
//         usernamePulse: {
//           '0%, 100%': { filter: 'drop-shadow(0 0 15px #00F5FF)' },
//           '50%': { filter: 'drop-shadow(0 0 25px #8B00FF)' },
//         },
//         streakPulse: {
//           '0%, 100%': { transform: 'scale(1)' },
//           '50%': { transform: 'scale(1.05)' },
//         },
//         profileMove: {
//           '0%': { transform: 'translate(0, 0)' },
//           '100%': { transform: 'translate(120px, 80px)' },
//         },
//       },
//     },
//   },
//   plugins: [],
// };


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}"
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Shared / First Config
//         'void-black': '#000000',
//         'deep-black': '#0D0D0D',
//         'charcoal': '#1A1A1A',
//         'dark-gray': '#2A2A2A',
//         'blood-red': '#CC0000',
//         'crimson-red': '#DC143C',
//         'neon-red': '#FF0040',
//         'bright-red': '#FF1A1A',
//         'dark-red': '#8B0000',
//         'electric-blue': '#00BFFF',
//         'cyber-cyan': '#00FFFF',
//         'neon-green': '#00FF41',
//         'matrix-green': '#39FF14',
//         'gold-yellow': '#FFD700',
//         'orange-flame': '#FF4500',
//         'purple-void': '#8A2BE2',
//         'electric-purple': '#9932CC',
//         'steel-gray': '#708090',
//         'silver': '#C0C0C0',
//         'white': '#FFFFFF',
//         'crimson-glow': '#DC143C',
//         'azure-glow': '#007FFF',
//         'emerald-glow': '#50C878',
//         'violet-glow': '#8A2BE2',
//         'amber-glow': '#FFBF00',

//         // Text variants
//         'text-primary': '#FFFFFF',
//         'text-secondary': '#C0C0C0',
//         'text-muted': '#808080',
//         'text-secondary-alt': '#CBD5E1',
//         'text-muted-alt': '#64748B',
//         'text-accent': '#06B6D4',

//         // Leaderboard / Rank colors
//         'slate-gray': '#1E293B',
//         'steel-blue': '#334155',
//         'rank-gold': '#FFD700',
//         'rank-silver': '#94A3B8',
//         'rank-bronze': '#CD7F32',
//         'champion-purple': '#7C3AED',
//         'battle-crimson': '#EF4444',
//         'victory-emerald': '#10B981',
//         'streak-orange': '#F97316',
//         'electric-cyan': '#06B6D4',
//         'neon-blue': '#3B82F6',
//         'matrix-green-alt': '#22C55E',
//         'plasma-pink': '#EC4899',
//         'digital-yellow': '#FACC15',

//         // From second config
//         'neon-cyan': '#00ffff',
//         'matrix-lime': '#32CD32',
//         'golden-amber': '#FFB000',
//         'flame-red': '#FF4500',
//         'ice-blue': '#87CEEB',
//         'royal-purple': '#6A0DAD',

//         // Backgrounds & borders
//         'bg-primary': '#0c0c16',
//         'bg-secondary': '#1a1a2e',
//         'bg-tertiary': '#16213e',
//         'bg-accent': '#0f3460',
//         'text-neon': '#00ffff',
//         'neon-pink': '#ff0080',
//         'neon-purple': '#7928ca',
//         'border-primary': '#2d2d5f',
//         'border-secondary': '#404080',
//         'border-neon': '#7928ca',
//       },
//       fontFamily: {
//         space: ['"Space Grotesk"', 'sans-serif'],
//         'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
//         'jetbrains-mono': ['"JetBrains Mono"', 'monospace'],
//         jetbrains: ['"JetBrains Mono"', 'monospace'],
//         inter: ['Inter', 'sans-serif'],
//         'fira-code': ['Fira Code', 'monospace'],
//       },
//       backgroundImage: {
//         // First config
//         'gradient-fire': 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
//         'gradient-cyber': 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
//         'gradient-void': 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
//         'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #00FF41 50%, #00FFFF 100%)',
//         'gradient-plasma': 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',

//         // Leaderboard gradients
//         'gradient-leaderboard': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
//         'gradient-champion': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
//         'gradient-victory': 'linear-gradient(135deg, #10B981 0%, #22C55E 50%, #06B6D4 100%)',
//         'gradient-battle': 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #F59E0B 100%)',

//         // Second config extras
//         'gradient-dashboard': 'linear-gradient(135deg, #8B00FF 0%, #00F5FF 50%, #32CD32 100%)',
//         'gradient-profile': 'linear-gradient(135deg, #FFB000 0%, #FF4500 50%, #8B00FF 100%)',
//         'gradient-stats': 'linear-gradient(135deg, #00F5FF 0%, #32CD32 50%, #FFB000 100%)',
//         'gradient-fire-alt': 'linear-gradient(135deg, #FF4500 0%, #FFB000 50%, #FF6347 100%)',
//         'gradient-logo-code': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
//         'gradient-logo-versus': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',

//         // Neon gradients
//         'neon-primary': 'linear-gradient(90deg, #ff0080, #7928ca, #3a00ff)',
//         'neon-secondary': 'linear-gradient(45deg, #00c6ff, #7928ca)',
//         'neon-accent': 'linear-gradient(135deg, #2cff05, #00ffff)',
//         'bg-gradient': 'linear-gradient(135deg, #0c0c16 0%, #1a1a2e 50%, #16213e 100%)',
//       },
//       animation: {
//         // Shared animations
//         'nav-slide': 'navSlide 1s ease forwards',
//         'logo-glow': 'logoGlow 4s ease-in-out infinite', // from first
//         'title-glow': 'titleGlow 3s ease-in-out infinite',
//         'pattern-move': 'patternMove 25s linear infinite',
//         'entry-slide': 'entrySlideIn 0.6s ease forwards',
//         'crown-float': 'crownFloat 2s ease-in-out infinite',
//         'avatar-spin': 'avatarSpin 3s linear infinite',
//         'fire-flicker': 'fireFlicker 1.5s ease-in-out infinite',
//         'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
//         'skeleton-shimmer': 'skeletonShimmer 1.5s ease-in-out infinite',
//         lightning: 'lightning 0.6s ease-out',
//         glow: 'glow 1.2s ease-in-out infinite',

//         // Extras
//         logoCodeGlow: 'logoCodeGlow 4s ease-in-out infinite',
//         logoVersusGlow: 'logoVersusGlow 4s ease-in-out infinite 0.5s',
//         avatarPulse: 'avatarPulse 3s ease-in-out infinite',
//         badgeFloat: 'badgeFloat 2s ease-in-out infinite',
//         usernamePulse: 'usernamePulse 3s ease-in-out infinite',
//         streakPulse: 'streakPulse 2s ease-in-out infinite',
//         profileMove: 'profileMove 25s linear infinite',

//         // From second config
//         'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
//         'logo-glow-alt': 'logo-glow 3s ease-in-out infinite alternate',
//         'timer-sweep': 'timer-sweep 2s linear infinite',
//         'neon-flicker': 'neon-flicker 2s infinite',
//         'fade-in': 'fadeIn 0.5s ease-out',
//         'slide-in': 'slideIn 0.3s ease-out',
//         'slide-out': 'slideOut 0.3s ease-in',
//       },
//       keyframes: {
//         navSlide: { to: { transform: 'translateY(0)' } },
//         logoGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 10px #06B6D4)' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.3) drop-shadow(0 0 20px #EC4899)' },
//         },
//         titleGlow: {
//           '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))' },
//           '50%': { filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.7))' },
//         },
//         patternMove: {
//           '0%': { transform: 'translate(0, 0)' },
//           '100%': { transform: 'translate(120px, 80px)' },
//         },
//         entrySlideIn: { to: { opacity: '1', transform: 'translateY(0)' } },
//         crownFloat: {
//           '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
//           '50%': { transform: 'translateY(-3px) rotate(5deg)' },
//         },
//         avatarSpin: {
//           '0%': { transform: 'rotate(0deg)' },
//           '100%': { transform: 'rotate(360deg)' },
//         },
//         fireFlicker: {
//           '0%, 100%': { transform: 'scale(1)', opacity: '1' },
//           '50%': { transform: 'scale(1.1)', opacity: '0.8' },
//         },
//         skeletonPulse: {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.7' },
//         },
//         skeletonShimmer: {
//           '0%': { backgroundPosition: '-200px 0' },
//           '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
//         },
//         lightning: {
//           '0%': { left: '-100%', opacity: '0' },
//           '20%': { opacity: '0.8' },
//           '100%': { left: '100%', opacity: '0' },
//         },
//         logoCodeGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))' },
//         },
//         logoVersusGlow: {
//           '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' },
//           '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(236, 72, 153, 0.7))' },
//         },
//         avatarPulse: {
//           '0%, 100%': { boxShadow: '0 0 40px rgba(255, 176, 0, 0.4)', transform: 'scale(1)' },
//           '50%': { boxShadow: '0 0 60px rgba(255, 176, 0, 0.6)', transform: 'scale(1.05)' },
//         },
//         badgeFloat: {
//           '0%, 100%': { transform: 'translateY(0)' },
//           '50%': { transform: 'translateY(-3px)' },
//         },
//         usernamePulse: {
//           '0%, 100%': { filter: 'drop-shadow(0 0 15px #00F5FF)' },
//           '50%': { filter: 'drop-shadow(0 0 25px #8B00FF)' },
//         },
//         streakPulse: {
//           '0%, 100%': { transform: 'scale(1)' },
//           '50%': { transform: 'scale(1.05)' },
//         },
//         profileMove: {
//           '0%': { transform: 'translate(0, 0)' },
//           '100%': { transform: 'translate(120px, 80px)' },
//         },

//         glow: {
//           '0%, 100%': { boxShadow: '0 0 12px 4px rgba(0,245,255, 0.70)' },
//           '50%': { boxShadow: '0 0 24px 12px rgba(0,245,255, 0.95)' },
//         },

//         // From second config
//         'neon-pulse': {
//           'from': { boxShadow: '0 0 5px #7928ca' },
//           'to': { boxShadow: '0 0 20px #7928ca, 0 0 30px #ff0080' },
//         },
//         'logo-glow-alt': {
//           'from': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.1' },
//           'to': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '0.3' },
//         },
//         'timer-sweep': {
//           '0%': { left: '-100%' },
//           '100%': { left: '100%' },
//         },
//         'neon-flicker': {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.8' },
//         },
//         'fadeIn': {
//           'from': { opacity: '0', transform: 'translateY(20px)' },
//           'to': { opacity: '1', transform: 'translateY(0)' },
//         },
//         'slideIn': {
//           'from': { transform: 'translateX(100%)', opacity: '0' },
//           'to': { transform: 'translateX(0)', opacity: '1' },
//         },
//         'slideOut': {
//           'from': { transform: 'translateX(0)', opacity: '1' },
//           'to': { transform: 'translateX(100%)', opacity: '0' },
//         },
//       },
//       boxShadow: {
//         'neon': '0 0 20px rgba(255, 0, 128, 0.4)',
//         'glow-neon': '0 0 30px rgba(121, 40, 202, 0.6)',
//         'primary': '0 8px 32px rgba(121, 40, 202, 0.3)',
//         'secondary': '0 4px 16px rgba(0, 255, 255, 0.2)',
//       },
//     },
//   },
//   plugins: [],
// };




/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Shared / First Config
        'void-black': '#000000',
        'deep-black': '#0D0D0D',
        'charcoal': '#1A1A1A',
        'dark-gray': '#2A2A2A',
        'blood-red': '#CC0000',
        'crimson-red': '#DC143C',
        'neon-red': '#FF0040',
        'bright-red': '#FF1A1A',
        'dark-red': '#8B0000',
        'electric-blue': '#00BFFF',
        'cyber-cyan': '#00FFFF',
        'neon-green': '#00FF41',
        'matrix-green': '#39FF14',
        'gold-yellow': '#FFD700',
        'orange-flame': '#FF4500',
        'purple-void': '#8A2BE2',
        'electric-purple': '#9932CC',
        'steel-gray': '#708090',
        'silver': '#C0C0C0',
        'white': '#FFFFFF',
        'crimson-glow': '#DC143C',
        'azure-glow': '#007FFF',
        'emerald-glow': '#50C878',
        'violet-glow': '#8A2BE2',
        'amber-glow': '#FFBF00',

        // Text variants
        'text-primary': '#FFFFFF',
        'text-secondary': '#C0C0C0',
        'text-muted': '#808080',
        'text-secondary-alt': '#CBD5E1',
        'text-muted-alt': '#64748B',
        'text-accent': '#06B6D4',

        // Leaderboard / Rank colors
        'slate-gray': '#1E293B',
        'steel-blue': '#334155',
        'rank-gold': '#FFD700',
        'rank-silver': '#94A3B8',
        'rank-bronze': '#CD7F32',
        'champion-purple': '#7C3AED',
        'battle-crimson': '#EF4444',
        'victory-emerald': '#10B981',
        'streak-orange': '#F97316',
        'electric-cyan': '#06B6D4',
        'neon-blue': '#3B82F6',
        'matrix-green-alt': '#22C55E',
        'plasma-pink': '#EC4899',
        'digital-yellow': '#FACC15',

        // From second config
        'neon-cyan': '#00ffff',
        'matrix-lime': '#32CD32',
        'golden-amber': '#FFB000',
        'flame-red': '#FF4500',
        'ice-blue': '#87CEEB',
        'royal-purple': '#6A0DAD',

        // Backgrounds & borders
        'bg-primary': '#0c0c16',
        'bg-secondary': '#1a1a2e',
        'bg-tertiary': '#16213e',
        'bg-accent': '#0f3460',
        'text-neon': '#00ffff',
        'neon-pink': '#ff0080',
        'neon-purple': '#7928ca',
        'border-primary': '#2d2d5f',
        'border-secondary': '#404080',
        'border-neon': '#7928ca',
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        'jetbrains-mono': ['"JetBrains Mono"', 'monospace'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
        inter: ['Inter', 'sans-serif'],
        'fira-code': ['Fira Code', 'monospace'],
        mono: ['Fira Code', 'monospace'], // from second config
      },
      backgroundImage: {
        // Gradients
        'gradient-fire': 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #00BFFF 0%, #00FFFF 50%, #00FF41 100%)',
        'gradient-void': 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
        'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #00FF41 50%, #00FFFF 100%)',
        'gradient-plasma': 'linear-gradient(135deg, #FF0040 0%, #8A2BE2 50%, #00BFFF 100%)',

        // Leaderboard
        'gradient-leaderboard': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
        'gradient-champion': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        'gradient-victory': 'linear-gradient(135deg, #10B981 0%, #22C55E 50%, #06B6D4 100%)',
        'gradient-battle': 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #F59E0B 100%)',

        // Extras
        'gradient-dashboard': 'linear-gradient(135deg, #8B00FF 0%, #00F5FF 50%, #32CD32 100%)',
        'gradient-profile': 'linear-gradient(135deg, #FFB000 0%, #FF4500 50%, #8B00FF 100%)',
        'gradient-stats': 'linear-gradient(135deg, #00F5FF 0%, #32CD32 50%, #FFB000 100%)',
        'gradient-fire-alt': 'linear-gradient(135deg, #FF4500 0%, #FFB000 50%, #FF6347 100%)',
        'gradient-logo-code': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        'gradient-logo-versus': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',

        // Neon
        'neon-primary': 'linear-gradient(90deg, #ff0080, #7928ca, #3a00ff)',
        'neon-secondary': 'linear-gradient(45deg, #00c6ff, #7928ca)',
        'neon-accent': 'linear-gradient(135deg, #2cff05, #00ffff)',
        'bg-gradient': 'linear-gradient(135deg, #0c0c16 0%, #1a1a2e 50%, #16213e 100%)',
      },
      animation: {
        'nav-slide': 'navSlide 1s ease forwards',
        'logo-glow': 'logoGlow 4s ease-in-out infinite',
        'title-glow': 'titleGlow 3s ease-in-out infinite',
        'pattern-move': 'patternMove 25s linear infinite',
        'entry-slide': 'entrySlideIn 0.6s ease forwards',
        'crown-float': 'crownFloat 2s ease-in-out infinite',
        'avatar-spin': 'avatarSpin 3s linear infinite',
        'fire-flicker': 'fireFlicker 1.5s ease-in-out infinite',
        'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
        'skeleton-shimmer': 'skeletonShimmer 1.5s ease-in-out infinite',
        lightning: 'lightning 0.6s ease-out',
        glow: 'glow 1.2s ease-in-out infinite',
        logoCodeGlow: 'logoCodeGlow 4s ease-in-out infinite',
        logoVersusGlow: 'logoVersusGlow 4s ease-in-out infinite 0.5s',
        avatarPulse: 'avatarPulse 3s ease-in-out infinite',
        badgeFloat: 'badgeFloat 2s ease-in-out infinite',
        usernamePulse: 'usernamePulse 3s ease-in-out infinite',
        streakPulse: 'streakPulse 2s ease-in-out infinite',
        profileMove: 'profileMove 25s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'logo-glow-alt': 'logo-glow 3s ease-in-out infinite alternate',
        'timer-sweep': 'timer-sweep 2s linear infinite',
        'neon-flicker': 'neon-flicker 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
      },
      keyframes: {
        navSlide: { to: { transform: 'translateY(0)' } },
        logoGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 10px #06B6D4)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.3) drop-shadow(0 0 20px #EC4899)' },
        },
        titleGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.7))' },
        },
        patternMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(120px, 80px)' },
        },
        entrySlideIn: { to: { opacity: '1', transform: 'translateY(0)' } },
        crownFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-3px) rotate(5deg)' },
        },
        avatarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fireFlicker: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        skeletonShimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        lightning: {
          '0%': { left: '-100%', opacity: '0' },
          '20%': { opacity: '0.8' },
          '100%': { left: '100%', opacity: '0' },
        },
        logoCodeGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' },
          '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))' },
        },
        logoVersusGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1) drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' },
          '50%': { opacity: '0.85', filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(236, 72, 153, 0.7))' },
        },
        avatarPulse: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(255, 176, 0, 0.4)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 60px rgba(255, 176, 0, 0.6)', transform: 'scale(1.05)' },
        },
        badgeFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        usernamePulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px #00F5FF)' },
          '50%': { filter: 'drop-shadow(0 0 25px #8B00FF)' },
        },
        streakPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        profileMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(120px, 80px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 12px 4px rgba(0,245,255, 0.70)' },
          '50%': { boxShadow: '0 0 24px 12px rgba(0,245,255, 0.95)' },
        },
        'neon-pulse': {
          'from': { boxShadow: '0 0 5px #7928ca' },
          'to': { boxShadow: '0 0 20px #7928ca, 0 0 30px #ff0080' },
        },
        'logo-glow-alt': {
          'from': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.1' },
          'to': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '0.3' },
        },
        'timer-sweep': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideIn': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'slideOut': {
          'from': { transform: 'translateX(0)', opacity: '1' },
          'to': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 0, 128, 0.4)',
        'glow-neon': '0 0 30px rgba(121, 40, 202, 0.6)',
        'primary': '0 8px 32px rgba(121, 40, 202, 0.3)',
        'secondary': '0 4px 16px rgba(0, 255, 255, 0.2)',
        'glow-pink': '0 0 20px rgba(255, 0, 64, 0.6)', // from second config
        'shadow-cyan': '0 0 10px rgba(0, 255, 255, 0.5)',
        'shadow-green': '0 0 10px rgba(0, 255, 64, 0.5)',
      },
      textShadow: {
        blue: '0 0 10px rgba(0, 191, 255, 0.5)',
        cyan: '0 0 10px rgba(0, 255, 255, 0.5)',
        green: '0 0 10px rgba(0, 255, 64, 0.5)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-blue': {
          textShadow: '0 0 10px rgba(0, 191, 255, 0.5)',
        },
        '.text-shadow-cyan': {
          textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
        },
        '.text-shadow-green': {
          textShadow: '0 0 10px rgba(0, 255, 64, 0.5)',
        },
      });
    },
  ],
};

