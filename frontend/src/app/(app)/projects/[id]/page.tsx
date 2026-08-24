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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const project: Project | undefined = getProjectById(id);
  if (!project) notFound();

  return <ProjectDetail project={project} initialWorkspaceTab={tab === "members" ? "members" : "overview"} />;
}
