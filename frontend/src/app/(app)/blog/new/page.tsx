"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconBold,
  IconItalic,
  IconList,
  IconLink,
  IconPhoto,
  IconQuote,
  IconCloudUpload,
  IconDeviceFloppy,
  IconWorld,
  IconX,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Company",
  "Tutorials",
];

const TOOLBAR: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { icon: IconBold, label: "Bold" },
  { icon: IconItalic, label: "Italic" },
  { icon: IconList, label: "Bulleted list" },
  { icon: IconLink, label: "Insert link" },
  { icon: IconPhoto, label: "Insert image" },
  { icon: IconQuote, label: "Blockquote" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  function publish() {
    toast.success("Post published", {
      description: title.trim()
        ? `“${title.trim()}” is now live.`
        : "Your post is now live.",
    });
    router.push("/blog");
  }

  function saveDraft() {
    toast.success("Draft saved", {
      description: "You can finish and publish it later.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New post"
        description="Draft your story, then publish it to your blog."
      >
        <Button variant="outline" asChild>
          <Link href="/blog">
            <IconX className="size-4" /> Cancel
          </Link>
        </Button>
        <Button onClick={publish}>
          <IconWorld className="size-4" /> Publish
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — editor */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="sr-only">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="h-auto border-0 px-0 py-1 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 md:text-3xl dark:bg-transparent"
                />
              </div>

              <Separator />

              {/* Faux rich-text toolbar */}
              <div className="flex flex-wrap items-center gap-1">
                {TOOLBAR.map((t) => (
                  <Button
                    key={t.label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    onClick={() => toast(t.label, { description: "Formatting applied." })}
                  >
                    <t.icon className="size-4" />
                    <span className="sr-only">{t.label}</span>
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Start writing your post…"
                rows={18}
                className="resize-none border-0 px-0 text-base leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="A short summary shown in previews and search results…"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="Draft">
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="Product">
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="product, launch, billing"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publish-date">Publish date</Label>
                <Input id="publish-date" type="date" defaultValue="2026-07-17" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cover image</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() =>
                  toast("Upload a cover image", {
                    description: "Drag an image here or browse your files.",
                  })
                }
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center transition-colors hover:bg-muted/50"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <IconCloudUpload className="size-5" />
                </span>
                <span className="text-sm font-medium">Upload cover image</span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG or WEBP up to 5&nbsp;MB
                </span>
              </button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={publish}>
              <IconWorld className="size-4" /> Publish post
            </Button>
            <Button variant="outline" onClick={saveDraft}>
              <IconDeviceFloppy className="size-4" /> Save draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
