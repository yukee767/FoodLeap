import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // uncomment to enable R2 cache
  // incrementalCache: "r2",
});
