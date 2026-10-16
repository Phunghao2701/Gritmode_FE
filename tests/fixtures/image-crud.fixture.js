import { test as base, expect } from 'playwright/test';

export const test = base.extend({
  imageCrud: async ({ page }, provide) => {
    await provide({
      openCrop: async (selector = 'input[type="file"]') => page.locator(selector),
      cropDialog: () => page.getByRole('dialog'),
      saveCrop: () => page.getByRole('button', { name: /lưu ảnh|save crop/i }),
      cancelCrop: () => page.getByRole('button', { name: /huỷ|cancel/i }),
    });
  },
});

export { expect };
