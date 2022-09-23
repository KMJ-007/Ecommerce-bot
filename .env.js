const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "production",
  };
  
  const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: "9000",

  };
  
  const fallback = {
    ...process.env,
    NODE_ENV: undefined,
  };
  
  module.exports = (environment) => {
    console.log(`Execution environment selected is: "${environment}"`);
    if (environment === "production") {
      return production;
    } else if (environment === "development") {
      return development;
    } else {
      return fallback;
    }
  };
  