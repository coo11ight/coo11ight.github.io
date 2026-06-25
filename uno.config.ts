import { defineConfig, presetTypography, presetWind3 } from 'unocss'

const hslVar = (name: string) => `hsl(var(--${name}) / <alpha-value>)`

export default defineConfig({
  content: {
    pipeline: {
      include: ['src/**/*.{astro,md,mdx,ts,tsx,js,jsx}', 'node_modules/astro-pure/**/*.{astro,ts,js}']
    }
  },
  presets: [presetWind3(), presetTypography()],
  theme: {
    colors: {
      background: hslVar('background'),
      foreground: hslVar('foreground'),
      card: hslVar('card'),
      'card-foreground': hslVar('card-foreground'),
      popover: hslVar('popover'),
      'popover-foreground': hslVar('popover-foreground'),
      primary: hslVar('primary'),
      'primary-foreground': hslVar('primary-foreground'),
      secondary: hslVar('secondary'),
      'secondary-foreground': hslVar('secondary-foreground'),
      muted: hslVar('muted'),
      'muted-foreground': hslVar('muted-foreground'),
      accent: hslVar('accent'),
      'accent-foreground': hslVar('accent-foreground'),
      destructive: hslVar('destructive'),
      'destructive-foreground': hslVar('destructive-foreground'),
      border: hslVar('border'),
      input: hslVar('input'),
      ring: hslVar('ring')
    }
  }
})
