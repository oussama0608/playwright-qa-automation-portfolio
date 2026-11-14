import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in' });
    this.error = page.getByTestId('login-error');
    this.usernameError = page.getByTestId('error-username');
    this.passwordError = page.getByTestId('error-password');
  }

  async goto(path = '/login') {
    await this.page.goto(path);
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
