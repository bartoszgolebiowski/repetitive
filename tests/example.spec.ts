import { test, type Page } from '@playwright/test';

type PlaywrightObject = Parameters<Parameters<typeof test>[1]>[0]

const signIn = async (page: Page) => {
  await page.goto('https://alert-humpback-26.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F')
  await page.getByRole('heading', { name: 'Sign in' }).waitFor({ state: 'visible' })
  await page.getByLabel('Email address').type('test@test.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { name: 'Enter your password' }).waitFor({ state: 'visible' })
  await page.getByLabel('Password', { exact: true }).type('test');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Action_Plan_ORG Action_Plan_ORG' }).waitFor({ state: 'visible' })
  return page
}

const performChangeStatus = async (page: Page) => {
  await page.getByRole('button', {
    name: /Line plan/i
  }).click();
  await page.getByRole('button', {
    name: /Line Plans Filters/i
  }).isVisible()
  await page.getByRole('cell', { name: /in_progress/i }).waitFor({ state: 'visible' });
  await page.getByRole('link', {
    name: /Navigate to Action Plans/i
  }).click();
  await page.getByRole('button', { name: /Action Plans Filters/i }).isVisible()
  await page.getByRole('cell', { name: /in_progress/i }).waitFor({ state: 'visible' });
  await page.getByRole('link', { name: /Navigate to Actions/i }).click();
  await page.getByRole('button', { name: /Actions Filters/i }).isVisible()
  await page.getByRole('cell', { name: /in_progress/i }).waitFor({ state: 'visible' });
  await page.getByRole('cell', { name: /rejected/i }).waitFor({ state: 'visible' });
  await page.getByRole('cell', { name: /IN_PROGRESS/i }).getByRole('button', { name: 'completed' }).click();
}

const checkStatusPropagation = async (page: Page) => {
  await page.getByRole('button', {
    name: /Line plan/i
  }).click();
  await page.getByRole('button', {
    name: /Line Plans Filters/i
  }).isVisible()
  await page.getByRole('cell', { name: /completed/i }).waitFor({ state: 'visible' });
  await page.getByRole('link', {
    name: /Navigate to Action Plans/i
  }).click();
  await page.getByRole('button', { name: /Action Plans Filters/i }).isVisible()
  await page.getByRole('cell', { name: /completed/i }).waitFor({ state: 'visible' });
  await page.getByRole('link', { name: /Navigate to Actions/i }).click();
  await page.getByRole('button', { name: /Actions Filters/i }).isVisible()
  await page.getByRole('cell', { name: /completed/i }).waitFor({ state: 'visible' });
  await page.getByRole('cell', { name: /rejected/i }).waitFor({ state: 'visible' });
}

test('log in', async ({ page }) => {
  await signIn(page)
});

test('change status for action, check status propagation for line plan, action plan and actions', async ({ page, browser }) => {
  await signIn(page)
  await performChangeStatus(page)
  await page.waitForTimeout(5000);
  await checkStatusPropagation(page)
})