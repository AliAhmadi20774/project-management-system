import { notFound } from "next/navigation";

import { projects, getProjectById, type Project } from "@/data";
import { ProjectDetail } from "./project-detail";

export const metadata = { title: "Project" };

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; from?: string }>;
}) {
  const { id } = await params;
  const { tab, from } = await searchParams;
  const project: Project | undefined = getProjectById(id);
  if (!project) notFound();

  const initialWorkspaceTab = ["overview", "board", "list", "timeline", "members", "activity"].includes(tab ?? "")
    ? tab as "overview" | "board" | "list" | "timeline" | "members" | "activity"
    : "overview";
  return <ProjectDetail project={project} initialWorkspaceTab={initialWorkspaceTab} fromProjectTimeline={from === "project-timeline"} />;
}
