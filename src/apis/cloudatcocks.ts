import { parse } from "node-html-parser";

export type Payout = {
  minerID: string | undefined;
  packageID: string | undefined;
  minerType: string | undefined;
  amount: string | undefined;
  date: string | undefined;
  type: string | undefined;
};
export type PayoutResponse = {};
export type LoginResponse = {
  valid: boolean;
};

export const CAC_MINING = "https://mining.cloudatcocks.com";

export class CloudatCocksClient {
  email?: string;
  password?: string;
  loggedIn: boolean;

  constructor(email?: string, password?: string) {
    this.email = email;
    this.password = password;
    this.loggedIn = false;
  }

  hasCredentials(): boolean {
    return this.email !== null && this.password !== null;
  }

  isLoggedIn(): Promise<boolean> {
    return fetch(`${CAC_MINING}/login`).then((resp) => {
      // if they're logged in we should be redirected
      return resp.redirected === true;
    });
  }

  login(): Promise<LoginResponse> {
    return this.getCSRFToken().then((token) => {
      const loginData = {
        email: this.email,
        password: this.password,
      };
      if (token) {
        return fetch(`${CAC_MINING}/login`, {
          method: "POST",
          body: JSON.stringify(loginData),
          headers: {
            "X-CSRF-TOKEN": token,
            "content-type": "application/json",
          },
        }).then((resp) => {
          // check where we're redirected to
          return {
            valid: resp.url === `${CAC_MINING}/dashboard`,
          };
        });
      } else {
        return { valid: false };
      }
    });
  }

  getCSRFToken(): Promise<string | undefined> {
    return fetch(`${CAC_MINING}/login`)
      .then((resp) => resp.text())
      .then((text) => {
        const dom = parse(text);
        const token = dom
          .querySelector("meta[name='csrf-token']")
          .getAttribute("content");
        return token;
      });
  }

  savePayout(payouts: Payout[]): Promise<PayoutResponse | undefined> {
    return this.getCSRFToken().then((token) => {
      if (token) {
        return fetch(`${CAC_MINING}/payouts/create`, {
          method: "POST",
          body: JSON.stringify(payouts),
          headers: {
            "X-CSRF-TOKEN": token,
            "content-type": "application/json",
          },
        });
      }
    });
    // TODO: It seems a 409 is just thrown (even for valid requests)
  }

  getCurrentBalance(): Promise<string | undefined> {
    return fetch(`${CAC_MINING}/api/v1/payouts/bitcoin`)
      .then((resp) => resp.text())
      .then((text) => {
        return text;
      });
  }
}
export default CloudatCocksClient;
