import { Check, ShoppingBag, Loader2 } from 'lucide-react'

export default function UIControls({
  ingredients,
  setIngredients,
  ingredientOptions,
  onAddToOrder,
  onViewInAR,
  arLoading = false,
  variantId,
  showArButton = true,
}) {
  const options = ingredientOptions ?? []
  const toggleIngredient = (key) => {
    setIngredients((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAddToOrder = () => {
    onAddToOrder?.(ingredients)
  }

  return (
    <>
      {/* AR Loading overlay */}
      {arLoading && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-live="polite"
        >
          <Loader2 className="h-12 w-12 animate-spin text-white" strokeWidth={2} />
          <p className="mt-4 text-lg font-medium text-white">Generating AR Model...</p>
        </div>
      )}

      {/* Glassmorphism bottom panel */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 pb-8 pt-6 md:left-1/2 md:right-auto md:w-full md:max-w-lg md:-translate-x-1/2 md:pb-10"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '32px 32px 0 0',
          boxShadow: '0 -25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderBottom: 'none',
        }}
      >
        {/* Ingredients row - horizontal scroll */}
        <div className="mb-4 overflow-x-auto pb-1 -mx-1 scrollbar-hide">
          <div className="flex gap-3 justify-start min-w-min px-1">
            {options.map(({ id, name, label }) => {
              const displayLabel = label ?? name ?? id
              const isActive = ingredients[id]
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleIngredient(id)}
                  className={`
                    flex-shrink-0 flex flex-col items-center gap-1.5 rounded-full p-2 min-h-[48px] min-w-[64px]
                    transition-all duration-200 touch-manipulation
                    ${isActive ? 'opacity-100 ring-4 ring-neutral-800' : 'opacity-50 ring-2 ring-neutral-300'}
                  `}
                  aria-pressed={isActive}
                  aria-label={`${displayLabel} ${isActive ? 'on' : 'off'}`}
                >
                  <span
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full
                      ${isActive ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-100/60 text-neutral-500'}
                    `}
                  >
                    {isActive ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-medium uppercase">{(displayLabel || id).slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="text-xs font-medium text-neutral-800">{displayLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Variant ID (debug) */}
        {variantId != null && (
          <div className="text-xs text-neutral-500 mb-2 tabular-nums">Variant ID: {variantId}</div>
        )}
        {/* Action row */}
        <div className="flex gap-3 items-stretch">
          {showArButton && (
            <button
              type="button"
              onClick={onViewInAR}
              disabled={arLoading}
              className="flex-1 min-h-[48px] rounded-full bg-neutral-900 text-white font-medium text-base px-6 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-70 touch-manipulation"
            >
              View in AR
            </button>
          )}
          <button
            type="button"
            onClick={handleAddToOrder}
            aria-label="Add to order"
            className={`min-h-[48px] rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center shadow-md active:scale-[0.98] transition-transform touch-manipulation border border-neutral-200/80 ${showArButton ? 'min-w-[48px]' : 'flex-1'}`}
          >
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  )
}
