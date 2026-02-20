import { test, expect } from '@playwright/test';

test('BookingFlow is responsive on small viewport (mobile)', async ({ page }) => {
  // mobile viewport (iPhone 12-ish)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5174/');

  // Open booking dialog
  await page.click('text=Book Now');
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog).toBeVisible();

  // Ensure dialog is top-aligned (not vertically centered off-screen)
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    // top should be near the viewport top (we used `top-4` on small screens)
    expect(box.y).toBeLessThanOrEqual(48);
    // dialog should not exceed viewport height
    expect(box.height).toBeLessThanOrEqual(820);
  }

  // Footer inside dialog should be visible and reachable
  const footer = dialog.locator('[data-slot="dialog-footer"]');
  await expect(footer).toBeVisible();

  // Footer CTA (Continue) should be visible and enabled
  const continueBtn = dialog.locator('button:has-text("Continue")');
  await expect(continueBtn).toBeVisible();
  await expect(continueBtn).toBeEnabled();
});