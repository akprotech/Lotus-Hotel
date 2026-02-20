import { test, expect } from '@playwright/test';

test('BookingFlow end-to-end', async ({ page }) => {
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');

  // Open booking dialog
  await page.click('[data-test-id="book-now-button"]');
  await page.waitForSelector('[data-slot="dialog-content"]');

  const dialog = page.locator('[data-slot="dialog-content"]');

  // Select room (first select inside dialog)
  const selects = dialog.locator('[data-slot="select-trigger"]');
  await selects.first().click();
  // choose first option via keyboard to avoid overlay click interception
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // Continue to Dates
  await page.click('text=Continue');

  // Fill dates: set check-in and check-out
  await page.locator('[data-slot="dialog-content"] input[type="date"]').nth(0).fill('2026-03-01');
  await page.locator('[data-slot="dialog-content"] input[type="date"]').nth(1).fill('2026-03-03');

  await page.click('text=Continue');

  // Fill guest details via labels (robust approach)
  await page.evaluate(() => {
    const dialog = document.querySelector('[data-slot="dialog-content"]');
    if (!dialog) return;
    const labels = Array.from(dialog.querySelectorAll('label'));
    const getInputAfter = (text: string) => {
      const l = labels.find((x) => x.textContent && x.textContent.includes(text));
      if (!l) return null;
      // try sibling input/textarea
      let el = l.nextElementSibling as HTMLElement | null;
      if (!el) el = l.parentElement?.querySelector('input, textarea') as HTMLElement | null;
      return el as HTMLInputElement | HTMLTextAreaElement | null;
    };
    const f = getInputAfter('First name'); if (f) (f as HTMLInputElement).value = 'TestFirst';
    const g = getInputAfter('Last name'); if (g) (g as HTMLInputElement).value = 'TestLast';
    const e = getInputAfter('Email'); if (e) (e as HTMLInputElement).value = 'test@example.com';
    const p = getInputAfter('Phone'); if (p) (p as HTMLInputElement).value = '+251911234567';
    const s = getInputAfter('Special requests'); if (s) (s as HTMLTextAreaElement).value = 'No preferences';
  });

  await page.click('text=Continue');

  // In review step, choose payment method (select should be present)
  // find payment select trigger by label and select first option via keyboard
  const paymentTrigger = dialog.locator(
    `xpath=.//label[contains(normalize-space(.), "Payment method")]/following::button[@data-slot="select-trigger"][1]`
  );
  await paymentTrigger.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  // Create booking
  await page.click('text=Create Booking');

  // Expect success state with reference shown
  await expect(page.locator('text=Your reference:')).toBeVisible({ timeout: 5000 });
});
