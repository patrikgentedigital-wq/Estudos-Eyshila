export const measureQuery = async (queryName: string, queryFn: () => PromiseLike<any>): Promise<any> => {
  const start = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    console.log(JSON.stringify({
      level: "INFO",
      type: "DB_ACCESS",
      queryName,
      durationMs: Math.round(duration),
      timestamp: new Date().toISOString()
    }));
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(JSON.stringify({
      level: "ERROR",
      type: "DB_ACCESS",
      queryName,
      durationMs: Math.round(duration),
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }));
    throw error;
  }
};
