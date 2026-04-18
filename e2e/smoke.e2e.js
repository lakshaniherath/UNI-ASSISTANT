describe("UniBuddy smoke test", () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  it("launches the app", async () => {
    await expect(element(by.type("RCTRootView"))).toBeVisible();
  });
});
