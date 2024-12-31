import { buildApp } from "./app";

const server = buildApp({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

server.listen({ port: 3000 }, (err, _address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log("Server is running at http://localhost:3000");
});
