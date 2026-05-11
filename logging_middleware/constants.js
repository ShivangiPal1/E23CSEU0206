const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal"
];

const VALID_PACKAGES = {
  backend: [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service"
  ],

  frontend: [
    "api",
    "component",
    "hook",
    "page",
    "state",
    "style"
  ],

  common: [
    "auth",
    "config",
    "middleware",
    "utils"
  ]
};

module.exports = {
  VALID_STACKS,
  VALID_LEVELS,
  VALID_PACKAGES
};