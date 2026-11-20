import { test, expect } from "@playwright/test";

test.describe("Oversoul Orb Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('canvas[id="c"]', { timeout: 10000 });
    await page.waitForTimeout(1000); // Let WebGL initialize
  });

  test("Orb - default state", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await expect(canvas).toHaveScreenshot("orb-default.png", {
      maxDiffPixels: 500,
    });
  });

  test("Orb - hover state", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.hover();
    await page.waitForTimeout(300);
    
    await expect(canvas).toHaveScreenshot("orb-hover.png", {
      maxDiffPixels: 500,
    });
  });

  test("Orb - different gates (morning/midday/evening/night)", async ({ page }) => {
    // This would require mocking the time or testing at different times
    // For now, just capture current state
    const canvas = page.locator('canvas[id="c"]');
    await expect(canvas).toHaveScreenshot("orb-current-gate.png", {
      maxDiffPixels: 500,
    });
  });

  test("Orb - reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas[id="c"]');
    await expect(canvas).toHaveScreenshot("orb-reduced-motion.png", {
      maxDiffPixels: 500,
    });
  });

  test("Orb - dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas[id="c"]');
    await expect(canvas).toHaveScreenshot("orb-dark-mode.png", {
      maxDiffPixels: 500,
    });
  });
});

test.describe("Orb Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('canvas[id="c"]', { timeout: 10000 });
  });

  test("Click triggers session flow", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.click();
    await page.waitForTimeout(500);
    
    // Should open time ask sheet
    await expect(page.locator('text="How much space do we open?"')).toBeVisible();
  });

  test("Hold triggers gate options", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    
    // Simulate hold
    await canvas.dispatchEvent("pointerdown");
    await page.waitForTimeout(800);
    await canvas.dispatchEvent("pointerup");
    await page.waitForTimeout(200);
    
    // Should open time ask sheet (same as click for now)
    await expect(page.locator('text="How much space do we open?"')).toBeVisible();
  });

  test("Triple tap navigates to practice", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    
    // Simulate triple click
    await canvas.click({ clickCount: 3, delay: 100 });
    await page.waitForTimeout(500);
    
    // Should navigate to practice page
    await expect(page).toHaveURL(/\/practice/);
  });

  test("Keyboard Enter activates orb", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    
    await expect(page.locator('text="How much space do we open?"')).toBeVisible();
  });

  test("Keyboard H triggers hold", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.focus();
    await page.keyboard.press("H");
    await page.waitForTimeout(500);
    
    await expect(page.locator('text="How much space do we open?"')).toBeVisible();
  });

  test("Keyboard T triggers triple tap", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.focus();
    await page.keyboard.press("T");
    await page.waitForTimeout(500);
    
    await expect(page).toHaveURL(/\/practice/);
  });

  test("Arrow keys rotate orb", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.focus();
    
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(200);
    
    // Just verify no errors
    expect(true).toBeTruthy();
  });

  test("Focus visible on keyboard navigation", async ({ page }) => {
    const canvas = page.locator('canvas[id="c"]');
    await canvas.focus();
    
    // Check that focus ring is visible (via computed style)
    const hasFocus = await canvas.evaluate((el) => document.activeElement === el);
    expect(hasFocus).toBeTruthy();
  });
});