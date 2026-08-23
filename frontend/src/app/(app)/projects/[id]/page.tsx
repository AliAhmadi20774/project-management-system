import { notFound } from "next/navigation";

import { projects, getProjectById, type Project } from "@/data";
import { ProjectDetail } from "./project-detail";

export const metadata = { title: "Project" };

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project: Project | undefined = getProjectById(id);
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
