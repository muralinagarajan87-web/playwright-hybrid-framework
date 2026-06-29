import { test, expect } from '../../../src/web/fixtures/pages.fixture';
import { USERS } from '../../../test-data/web/users';

// Login tests must run without pre-authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Module', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('TC_LOGIN_001 — verify successful login with valid credentials', { tag: ['@sanity', '@regression', '@positive'] }, async ({ loginPage, inventoryPage }) => {
    await test.step('Enter valid username and password and click Login', async () => {
      await loginPage.login(USERS.standard.username, USERS.standard.password);
    });

    await test.step('Verify the inventory page is displayed', async () => {
      await inventoryPage.expectOnPage();
    });

    await test.step('Verify no error message is shown', async () => {
      await loginPage.expectNoError();
    });
  });

  test('TC_LOGIN_002 — verify login fails with an invalid password', { tag: ['@sanity', '@regression', '@negative'] }, async ({ loginPage }) => {
    await test.step('Enter valid username with an incorrect password and click Login', async () => {
      await loginPage.login(USERS.standard.username, 'wrong_password');
    });

    await test.step('Verify the error message is displayed', async () => {
      await loginPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "Username and password do not match"', async () => {
      await expect(loginPage.errorMessage).toContainText('Username and password do not match');
    });
  });

  test('TC_LOGIN_003 — verify a locked-out user is blocked from logging in', { tag: ['@regression', '@negative'] }, async ({ loginPage }) => {
    await test.step('Enter locked-out user credentials and click Login', async () => {
      await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
    });

    await test.step('Verify the error message is displayed', async () => {
      await loginPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "Sorry, this user has been locked out"', async () => {
      await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out');
    });
  });

  test('TC_LOGIN_004 — verify login validation when the username field is empty', { tag: ['@regression', '@negative'] }, async ({ loginPage }) => {
    await test.step('Leave username blank, enter password, and click Login', async () => {
      await loginPage.login('', USERS.standard.password);
    });

    await test.step('Verify the error message is displayed', async () => {
      await loginPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "Username is required"', async () => {
      await expect(loginPage.errorMessage).toContainText('Username is required');
    });
  });

  test('TC_LOGIN_005 — verify login validation when the password field is empty', { tag: ['@regression', '@negative'] }, async ({ loginPage }) => {
    await test.step('Enter username, leave password blank, and click Login', async () => {
      await loginPage.login(USERS.standard.username, '');
    });

    await test.step('Verify the error message is displayed', async () => {
      await loginPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "Password is required"', async () => {
      await expect(loginPage.errorMessage).toContainText('Password is required');
    });
  });
});
