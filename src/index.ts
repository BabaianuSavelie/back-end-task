import express from "express";

import { config } from "dotenv";
import { initSequelizeClient } from "./sequelize";
import { initUsersRouter } from "./routers";
import { initPostsRouter } from "./routers";
import {
  initErrorRequestHandler,
  initNotFoundRequestHandler,
} from "./middleware";
import { Dialect } from "sequelize";

const PORT = 8080;

async function main(): Promise<void> {
  const app = express();
  config();

  // TODO(roman): store these credentials in some external configs
  // so that they don't end up in the git repo
  const sequelizeClient = await initSequelizeClient({
    dialect: process.env.DIALECT as Dialect,
    host: process.env.HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  app.use(express.json());

  app.use("/api/v1/users", initUsersRouter(sequelizeClient));
  app.use("/api/v1/posts", initPostsRouter(sequelizeClient));

  app.use("/", initNotFoundRequestHandler());

  app.use(initErrorRequestHandler());

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.info(`app listening on port: '${PORT}'`);

      resolve();
    });
  });
}

main()
  .then(() => console.info("app started"))
  .catch(console.error);
