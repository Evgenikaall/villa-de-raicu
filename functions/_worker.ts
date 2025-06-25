import { Container } from "@cloudflare/containers";

export class Api extends Container {
    defaultPort = 8080;          // same as SERVER_PORT
    sleepAfter  = "2m";          // auto-hibernate
}

export default {
    async fetch(request: Request, env: Env) {
        // Proxy every /api/* request to the Java container
        if (new URL(request.url).pathname.startsWith("/api/")) {
            return env.Api.fetch(request);     // cold-starts a container if asleep
        }
        // Otherwise serve static assets (React build) automatically
        return env.ASSETS.fetch(request);
    },
};
