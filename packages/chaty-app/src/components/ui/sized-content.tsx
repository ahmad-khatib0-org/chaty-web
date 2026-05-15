import { ReactNode, useMemo } from 'react'

interface Props {
  /**
   * Pixel width of the content
   */
  width: number

  /**
   * Pixel height of the content
   */
  height: number

  /**
   * The content itself
   */
  children: ReactNode
}

const MIN_W = 160
const MIN_H = 120
const MAX_S = 420

/**
 * Automatic message content sizing for images, videos and embeds
 */
export function SizedContent({ height, width, children }: Props) {
  const size = useMemo(() => {
    let w = width
    let h = height

    // **Example:** 400×50 image (wide but too short)
    //
    // - **Initial:** width = 400, height = 50
    //
    // - **Step 1 (min width):** width 400 > 160 ✓ no change
    //
    // - **Step 2 (min height):** height 50 < 120
    //   `width *= 120 / 50` → 400 × 2.4 = **960**
    //   `height = 120`
    //
    // - **Step 3 (max size):** width 960 > 420
    //   `height /= 400 / 420` → 120 / 0.952 = **126**
    //   `width = 420`
    //
    // - **Final:** **420×126** (ratio preserved: 8:1 → 3.33:1)
    //
    // **Example:** 300×500 image (not wide enough, too tall)

    // - **Initial:** width = 300, height = 500
    //
    // - **Step 1 (min width):** width 300 > 160 ✓ no change
    //
    // - **Step 2 (min height):** height 500 > 120 ✓ no change
    //
    // - **Step 3 (max size - width):** width 300 < 420 ✓ no change
    //
    // - **Step 4 (max size - height):** height 500 > 420
    //   `width /= 500 / 420` → 300 / 1.19 = **252**
    //   `height = 420`
    //
    // - **Final:** **252×420** (ratio preserved: 0.6 → 0.6)
    //
    // **Another example:** 100×500 image (too narrow AND too tall)
    //
    // - **Initial:** width = 100, height = 500
    //
    // - **Step 1:** width 100 < 160
    //   `height *= 160 / 100` → 500 × 1.6 = **800**
    //   `width = 160`
    //
    // - **Step 2:** height 800 > 120 ✓ no change
    //
    // - **Step 3:** width 160 < 420 ✓ no change
    //
    // - **Step 4:** height 800 > 420
    //   `width /= 800 / 420` → 160 / 1.9 = **84**
    //   `height = 420`
    //
    // - **Final:** **84×420** (ratio preserved: 0.2 → 0.2)

    // ensure min size for height and width
    if (w < MIN_W) {
      h *= MIN_W / w
      w = MIN_W
    }
    if (h < MIN_H) {
      w *= MIN_H / h
      h = MIN_H
    }

    // scale down to required size
    if (w > MAX_S) {
      h /= w / MAX_S
      w = MAX_S
    }

    if (h > MAX_S) {
      w /= h / MAX_S
      h = MAX_S
    }

    return { width: w, height: h }
  }, [width, height])

  return (
    <div
      className='grid h-auto max-w-full overflow-hidden rounded-md'
      style={{
        width: `${size.width}px`,
        aspectRatio: `${size.width} / ${size.height}`,
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
      }}>
      <div
        style={{
          gridArea: '1 / 1 / 2 / 2',
          width: '100%',
          height: '100%',
          minHeight: 0,
          objectFit: 'contain',
        }}>
        {children}
      </div>
    </div>
  )
}
