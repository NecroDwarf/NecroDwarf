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
}
export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  tagline: string;
  theme: string;
  Art: ComponentType;
  Page: ComponentType;
  releases: readonly Release[];
}
export interface PageMeta {
  title: string;
  description: string;
}
