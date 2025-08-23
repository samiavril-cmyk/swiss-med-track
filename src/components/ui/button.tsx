import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-medical text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-card hover:shadow-card-hover",
        medical: "bg-gradient-medical text-white hover:shadow-elegant hover:scale-[1.02] shadow-card",
        secondary: "bg-transparent border border-primary text-primary hover:bg-secondary hover:text-secondary-foreground hover:border-secondary",
        outline: "border border-card-border bg-card hover:bg-muted hover:text-card-foreground",
        ghost: "hover:bg-muted hover:text-card-foreground",
        link: "text-primary hover:text-primary-hover underline-offset-4 hover:underline",
        success: "bg-success text-white hover:opacity-90 shadow-card",
        warning: "bg-warning text-white hover:opacity-90 shadow-card",
        error: "bg-error text-white hover:opacity-90 shadow-card",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-medical px-8 text-base",
        xl: "h-14 rounded-medical px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
