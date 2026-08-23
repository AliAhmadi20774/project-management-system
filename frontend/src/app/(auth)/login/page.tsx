import Link from "next/link";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full">
          <IconBrandGoogle className="size-4" /> Google
        </Button>
        <Button variant="outline" className="w-full">
          <IconBrandGithub className="size-4" /> GitHub
        </Button>
      </div>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-background px-2">or continue with</span>
        <span className="absolute inset-y-1/2 left-0 h-px w-full bg-border" />
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="alex@orbynadmin.com" defaultValue="alex.morgan@orbynadmin.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" defaultValue="password" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>
        <Button asChild className="w-full">
          <Link href="/dashboard">Sign in</Link>
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
