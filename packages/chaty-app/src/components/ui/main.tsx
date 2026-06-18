/**
 * Styles for the main content of a page
 *
 * This creates a surface on the lowest level with appropriate padding and separation.
 */
export const main = (additionalClasses = '') => {
  return `
    flex-grow min-w-0 min-h-0 flex overflow-hidden flex-col 
    px-[var(--gap-md)] mx-[var(--gap-md)] mb-[var(--gap-md)] 
    rounded-[var(--borderRadius-xl)] bg-[var(--md-sys-color-surface-container-lowest)] 
    ${additionalClasses} 
  `
}
