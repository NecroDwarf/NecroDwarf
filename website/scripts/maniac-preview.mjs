import { build, createServer, preview } from "vite";
import { resolve } from "node:path";
const mode = process.argv[2] ?? "dev";
const buildOptions = {
  outDir: ".preview/maniac",
  rollupOptions: { input: resolve("maniac-lab.html") },
};
if (mode === "build") {
  await build({ appType: "mpa", build: buildOptions });
} else if (mode === "serve") {
  const server = await preview({
    appType: "mpa",
    build: buildOptions,
    preview: { host: "127.0.0.1", port: 4175, strictPort: true },
  });
  server.printUrls();
} else {
  const server = await createServer({
    appType: "mpa",
    server: { host: "127.0.0.1", port: 5175, strictPort: true },
    plugins: [
      {
        name: "isolated-maniac-lab",
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
            if (
              ["/", "/__maniac-lab"].includes(
                (request.url ?? "/").split("?")[0],
              )
            )
              request.url = "/maniac-lab.html";
            next();
          });
        },
      },
    ],
  });
  await server.listen();
  server.printUrls();
}
