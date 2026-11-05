import { expect, test } from '@playwright/test'

test('home page loads and shows CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /ground school/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /browse modules/i })).toBeVisible()
})

test('disclaimer is visible on every page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('note')).toContainText('educational purposes only')
})

test('intro lesson loads', async ({ page }) => {
  await page.goto('/#/lessons/intro')
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
})

test('intro lesson question is interactive', async ({ page }) => {
  await page.goto('/#/lessons/intro')
  await page.getByRole('button', { name: /decreases/i }).click()
  await expect(page.getByText('Correct!')).toBeVisible()
})
