module.exports = {
  testMatch: ["**/e2e/**/*.e2e.js"],
  testTimeout: 120000,
  maxWorkers: 1,
  reporters: ["detox/runners/jest/reporter"],
  testEnvironment: "detox/runners/jest/testEnvironment",
  verbose: true,
};
