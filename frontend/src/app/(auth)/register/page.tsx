import Link from "next/link";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
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
        <span className="relative z-10 bg-background px-2">or</span>
        <span className="absolute inset-y-1/2 left-0 h-px w-full bg-border" />
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first">First name</Label>
            <Input id="first" placeholder="Alex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last">Last name</Label>
            <Input id="last" placeholder="Morgan" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="alex@orbynadmin.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a password" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm font-normal">
            I agree to the Terms & Privacy Policy
          </Label>
        </div>
        <Button asChild className="w-full">
          <Link href="/dashboard">Create account</Link>
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
