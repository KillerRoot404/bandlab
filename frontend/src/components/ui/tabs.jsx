import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "../../lib/utils"

// Context to pass styling variant from TabsList to TabsTrigger
const TabsStyleContext = React.createContext({ variant: "segment" })

const Tabs = TabsPrimitive.Root

function useIsOverflow(ref) {
  const [isOverflowing, setIsOverflowing] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const update = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const overflowing = el.scrollWidth > el.clientWidth + 2 // small epsilon
    setIsOverflowing(overflowing)
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
  }, [ref])

  React.useEffect(() => {
    update()
    const el = ref.current
    if (!el) return

    const onScroll = () => update()
    el.addEventListener("scroll", onScroll, { passive: true })

    const ro = new ResizeObserver(() => update())
    ro.observe(el)

    const handleResize = () => update()
    window.addEventListener("resize", handleResize)

    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", handleResize)
      ro.disconnect()
    }
  }, [ref, update])

  return { isOverflowing, canScrollLeft, canScrollRight, refresh: update }
}

const TabsList = React.forwardRef(({ className, children, variant = "segment", scrollable = true, withArrows = true, ...props }, ref) => {
  const scrollRef = React.useRef(null)
  const { isOverflowing, canScrollLeft, canScrollRight } = useIsOverflow(scrollRef)

  const scrollBy = (delta) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: delta, behavior: "smooth" })
  }

  return (
    <TabsStyleContext.Provider value={{ variant }}>
      <div className={cn("relative", variant === "segment" ? "" : "")}>
        {withArrows && scrollable && isOverflowing && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-180)}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-[#1a1a1b]/80 border border-gray-700 text-gray-300 hover:text-white hover:bg-[#242529] shadow transition disabled:opacity-30",
                !canScrollLeft && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4 mx-auto" />
            </button>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#131315] to-transparent" />
          </>
        )}

        <TabsPrimitive.List
          ref={(node) => {
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
            scrollRef.current = node
          }}
          className={cn(
            // base: horizontal pills that can scroll
            "inline-flex items-center justify-start gap-1 rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto overflow-y-hidden scroll-smooth whitespace-nowrap no-scrollbar",
            // underline variant base overrides
            variant === "underline" && "bg-transparent p-0 rounded-none border-b border-muted/40 text-muted-foreground",
            className
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>

        {withArrows && scrollable && isOverflowing && (
          <>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(180)}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-[#1a1a1b]/80 border border-gray-700 text-gray-300 hover:text-white hover:bg-[#242529] shadow transition disabled:opacity-30",
                !canScrollRight && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight className="w-4 h-4 mx-auto" />
            </button>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#131315] to-transparent" />
          </>
        )}
      </div>
    </TabsStyleContext.Provider>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TabsStyleContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        variant === "segment"
          ? "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground"
          : "relative inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:text-white data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-[#ff4500]",
        className
      )}
      {...props} />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }