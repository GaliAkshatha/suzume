import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  accessTokenTtl: "15m",
  refreshTokenTtl: "7d",
  refreshTokenTtlMs: 7 * 24 * 60 * 60 * 1000,
};
