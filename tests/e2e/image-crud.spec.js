import { test, expect } from '../fixtures/image-crud.fixture.js';

test.describe('admin image crop CRUD', () => {
  test.skip(!globalThis.process?.env?.RUN_IMAGE_E2E, 'Set RUN_IMAGE_E2E=1 with a controlled admin fixture environment.');

  test('product crop opens, previews, resets and cancels without finalizing', async ({ page, imageCrud }) => {
    await page.goto('/admin/products/create');
    await imageCrud.openCrop().setInputFiles('tests/fixtures/portrait.svg');
    await expect(imageCrud.cropDialog()).toBeVisible();
    await imageCrud.cropDialog().getByRole('button', { name: /zoom in/i }).click();
    await imageCrud.cropDialog().getByRole('button', { name: /reset crop/i }).click();
    await imageCrud.cancelCrop().click();
    await expect(imageCrud.cropDialog()).toHaveCount(0);
  });

  test('collection context remains available alongside profile crop integration', async ({ page }) => {
    await page.goto('/admin/collections/create');
    await expect(page.locator('body')).toContainText(/bộ sưu tập/i);
  });
});
