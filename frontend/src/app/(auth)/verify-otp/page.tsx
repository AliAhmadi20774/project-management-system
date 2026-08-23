"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconShieldLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = React.useState<string[]>(Array(LENGTH).fill(""));
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const complete = code.length === LENGTH;

  function setAt(i: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleChange(i: number, raw: string) {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setAt(i, "");
      return;
    }
    // Support pasting a full code into any box.
    if (value.length > 1) {
      const chars = value.slice(0, LENGTH - i).split("");
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, k) => (next[i + k] = c));
        return next;
      });
      const last = Math.min(i + chars.length, LENGTH - 1);
      inputs.current[last]?.focus();
      return;
    }
    setAt(i, value);
    if (i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl border bg-card">
          <IconShieldLock className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Two-factor verification
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">alex@orbynadmin.com</span>. Enter
          it below to continue.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/dashboard");
        }}
      >
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={LENGTH}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                "size-12 rounded-lg border bg-background text-center text-lg! font-semibold tabular-nums shadow-sm outline-none transition-colors",
                "focus:border-ring focus:ring-2 focus:ring-ring/40",
                d && "border-foreground/30"
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={!complete}>
          Verify
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          className="font-medium text-foreground hover:underline"
          onClick={() => {
            setDigits(Array(LENGTH).fill(""));
            inputs.current[0]?.focus();
          }}
        >
          Resend
        </button>
      </p>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
