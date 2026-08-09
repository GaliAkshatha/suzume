process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/suzume_test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-not-for-production";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-not-for-production";
process.env.CLIENT_URL ??= "http://localhost:5173";
