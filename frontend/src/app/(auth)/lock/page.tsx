"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/data";

export default function LockPage() {
  const [show, setShow] = useState(false);

  const initials = currentUser.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground">
            <IconLock className="size-3.5" />
          </span>
        </div>
        <div className="space-y-1.5">
          <p className="font-medium">{currentUser.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your session is locked
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {firstName}. Enter your password to unlock and pick up
            right where you left off.
          </p>
        </div>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lock-password">Password</Label>
          <div className="relative">
            <Input
              id="lock-password"
              type={show ? "text" : "password"}
              defaultValue="password"
              className="pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? (
                <IconEyeOff className="size-4" />
              ) : (
                <IconEye className="size-4" />
              )}
            </button>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href="/dashboard">
            Unlock <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Not you?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in as a different user
        </Link>
      </p>
    </div>
  );
}
