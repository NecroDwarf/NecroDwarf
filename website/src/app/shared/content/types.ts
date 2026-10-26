import type { ComponentType } from "react";
export interface Release {
  background?: { src: string; width: number; height: number };
  id: string;
  projectId: string;
  version: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  releaseOrder: number;
  status: "draft" | "published";
  theme: string;
  tags?: readonly string[];
  source: string;
  href?: string;
}
export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  tagline: string;
  theme: string;
  status?: "idea" | "development" | "beta" | "released" | "paused";
  longDescription?: readonly string[];
  features?: readonly string[];
  cover?: ProjectImage;
  gallery?: readonly ProjectImage[];
  links?: Partial<
    Record<"github" | "website" | "documentation" | "download", string>
  >;
  platforms?: readonly string[];
  Art?: ComponentType;
  releases: readonly Release[];
}
export type ProjectMeta = Omit<Project, "releases">;
export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}
export interface PageMeta {
  title: string;
  description: string;
}
