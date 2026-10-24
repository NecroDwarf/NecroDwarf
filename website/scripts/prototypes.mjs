// Archived designs have their own dev entry and never enter the public build.
import { createServer } from "vite";
const paths = new Set([
  "/",
  "/neo-tech",
  "/dark-forge",
  "/neo-forge",
  "/neo-tech-v2",
]);
const server = await createServer({
  server: { host: "127.0.0.1", port: 5174 },
  plugins: [
    {
      name: "archived-prototype-entry",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (
            paths.has(
              (request.url || "/").split("?")[0].replace(/\/$/, "") || "/",
            )
          )
            request.url = "/prototypes.html";
          next();
        });
      },
    },
  ],
});
await server.listen();
server.printUrls();
