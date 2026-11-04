export const docsBase = "/projects/novellmaker/docs";
export const docPath = (slug: string) =>
  slug === "engine-guide"
    ? `${docsBase}/engine-guide`
    : slug === "index"
      ? `${docsBase}/lua`
      : `${docsBase}/lua/${slug}`;
