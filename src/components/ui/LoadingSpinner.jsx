/**
 * LoadingSpinner.jsx
 *
 * Flexible spinner component.
 * Props:
 *  - size   : 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *  - color  : Tailwind text-* class        (default 'text-primary-600')
 *  - label  : accessible sr-only label     (default 'Loading…')
 *  - fullPage: boolean — centers in viewport (default false)
 */

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
  xl: 'w-14 h-14 border-4',
};

export default function LoadingSpinner({
  size      = 'md',
  color     = 'text-primary-600',
  label     = 'Loading…',
  fullPage  = false,
}) {
  const spinner = (
    <span role="status" className="inline-flex items-center justify-center">
      <span
        className={`
          inline-block rounded-full border-current border-r-transparent
          animate-spin ${SIZES[size] ?? SIZES.md} ${color}
        `}
      />
      <span className="sr-only">{label}</span>
    </span>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center
                      bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
