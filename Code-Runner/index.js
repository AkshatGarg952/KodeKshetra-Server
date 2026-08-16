import createApp from "./src/app.js";
import appConfig from "./src/config/appConfig.js";

const app = createApp();

app.listen(appConfig.port, () => {
  console.log(`Code Runner listening on port ${appConfig.port}`);
});

