import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function InputField({
  label,
  type = "text",
  value = "",
  onChange,
  state,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!state;
  const isActive = focused || value;
  const isPassword = type === "password";

  return (
    <div className="w-full flex flex-col">
      {/* Hide native browser password icons */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
      `}</style>

      <div className="relative">
        {/* Floating Label */}
        <label
          className={`
            absolute left-5 z-10 pointer-events-none transition-all duration-200
            ${
              isActive
                ? "-top-2 text-sm bg-white px-1"
                : "top-1/2 -translate-y-1/2 text-base"
            }
            ${
              hasError
                ? "text-red-500"
                : focused
                ? "text-blue-600"
                : "text-gray-500"
            }
          `}
        >
          {label}
        </label>

        {/* Input Wrapper */}
        <div
          className={`
            flex items-center
            h-14
            rounded-xl
            border
            bg-white
            overflow-hidden
            transition-all
            ${
              hasError
                ? "border-red-500 focus-within:ring-2 focus-within:ring-red-300"
                : focused
                ? "border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                : "border-gray-300"
            }
          `}
        >
          {/* Input */}
          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            style={{ color: "#111827" }} // FORCE DARK TEXT
            className={`
              w-full
              h-full
              bg-transparent
              px-5
              text-lg
              outline-none
              placeholder-transparent
              ${isPassword ? "pr-12" : "pr-5"}
            `}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <HiEyeOff className="h-5 w-5" />
              ) : (
                <HiEye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="mt-1 text-sm text-red-500">
          {state}
        </p>
      )}
    </div>
  );
}