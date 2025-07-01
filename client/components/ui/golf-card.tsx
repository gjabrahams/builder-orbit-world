import * as React from "react";
import { cn } from "@/lib/utils";

interface GolfCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

const GolfCard = React.forwardRef<HTMLDivElement, GolfCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-green-200 text-card-foreground",
          {
            "golf-card": variant === "default",
            "bg-white/90 backdrop-blur-sm shadow-xl border-green-300":
              variant === "elevated",
            "bg-transparent border-2 border-primary/30 hover:border-primary/50":
              variant === "outlined",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
GolfCard.displayName = "GolfCard";

const GolfCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
GolfCardHeader.displayName = "GolfCardHeader";

const GolfCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
GolfCardTitle.displayName = "GolfCardTitle";

const GolfCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GolfCardDescription.displayName = "GolfCardDescription";

const GolfCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GolfCardContent.displayName = "GolfCardContent";

const GolfCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
GolfCardFooter.displayName = "GolfCardFooter";

export {
  GolfCard,
  GolfCardHeader,
  GolfCardFooter,
  GolfCardTitle,
  GolfCardDescription,
  GolfCardContent,
};
