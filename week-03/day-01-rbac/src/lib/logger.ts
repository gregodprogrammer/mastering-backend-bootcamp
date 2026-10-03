import pino from "pino";
import { config } from "./config.js";

const loggerOptions = {
  level: config.NODE_ENV === "production" ? "info" : "debug",
};

if (config.NODE_ENV !== "production") {
  Object.assign(loggerOptions, {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  });
}

export const logger = pino(loggerOptions);

