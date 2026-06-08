"use client";
import React from "react";
import { Spinner } from "@/components/ui/spinner-1";
import clsx from "clsx";

const sizeMap = [
  { tiny: "px-1.5 h-6 text-sm", small: "px-1.5 h-8 text-sm", medium: "px-2.5 h-10 text-sm", large: "px-3.5 h-12 text-base" },
  { tiny: "w-6 h-6 text-sm",    small: "w-8 h-8 text-sm",    medium: "w-10 h-10 text-sm",   large: "w-12 h-12 text-base" },
];

const typeMap = {
  primary:   "bg-black hover:bg-[#222] text-white fill-white",
  secondary: "bg-white hover:bg-black/5 text-black fill-black border border-black/10",
  tertiary:  "bg-transparent hover:bg-black/5 text-black fill-black",
  error:     "bg-red-600 hover:bg-red-700 text-white fill-white",
  warning:   "bg-amber-500 hover:bg-amber-600 text-black fill-black",
};

const shapeMap = {
  square:  { tiny: "rounded",         small: "rounded-md",      medium: "rounded-md", large: "rounded-lg" },
  circle:  { tiny: "rounded-full",    small: "rounded-full",    medium: "rounded-full", large: "rounded-full" },
  rounded: { tiny: "rounded-[100px]", small: "rounded-[100px]", medium: "rounded-[100px]", large: "rounded-[100px]" },
};

export interface ButtonProps {
  size?: keyof (typeof sizeMap)[0];
  type?: keyof typeof typeMap;
  shape?: keyof typeof shapeMap;
  svgOnly?: boolean;
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  "aria-label"?: string;
}

export const Button = ({
  size = "medium",
  type = "primary",
  shape = "square",
  svgOnly = false,
  children,
  prefix,
  suffix,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className,
  ...rest
}: ButtonProps) => (
  <button
    type="button"
    disabled={disabled || loading}
    onClick={onClick}
    className={clsx(
      "flex justify-center items-center gap-0.5 duration-150 transition-colors",
      sizeMap[+svgOnly][size],
      disabled || loading ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" : typeMap[type],
      shapeMap[shape][size],
      fullWidth && "w-full",
      className
    )}
    {...rest}
  >
    {loading ? <Spinner size={size === "large" ? 24 : 16} /> : prefix}
    {children && (
      <span className="relative overflow-hidden whitespace-nowrap text-ellipsis font-sans px-1.5">
        {children}
      </span>
    )}
    {!loading && suffix}
  </button>
);
