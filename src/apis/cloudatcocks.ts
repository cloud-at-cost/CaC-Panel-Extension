import { parse } from "node-html-parser";

export type Payout = {
  minerID: string | undefined;
  minerType: string | undefined;
  amount: string | undefined;
  date: string | undefined;
  type: string | undefined;
};
export type PayoutResponse = {
  total: number;
  successful: number;
  failed: number;
  new: number;
  existing: number;
};
export type LoginResponse = {
  valid: boolean;
};
export type OS = {
  name: string;
  id: string;
};
export type OSResponse = {
  oses: OS[];
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

  savePayout(payouts: Payout[]): Promise<PayoutResponse> {
    return this.getCSRFToken().then((token) => {
      if (token) {
        return fetch(`${CAC_MINING}/payouts/create`, {
          method: "POST",
          body: JSON.stringify({
            payouts: payouts,
            api: true,
          }),
          headers: {
            "X-CSRF-TOKEN": token,
            "content-type": "application/json",
          },
        })
          .then((resp) => resp.json())
          .then((json) => {
            return json;
          });
      } else {
        throw new Error("Unable to get CSRF token to make request");
      }
    });
  }

  resetPayouts(): Promise<boolean> {
    return this.getCSRFToken().then((token) => {
      if (token) {
        return fetch(`${CAC_MINING}/payouts`, {
          method: "DELETE",
          headers: {
            "X-CSRF-TOKEN": token,
            "content-type": "application/json",
          },
        }).then((resp) => {
          // assume it was successful based off a 200 status code
          return resp.status === 200;
        });
      } else {
        throw new Error("Unable to get CSRF token to make request");
      }
    });
  }

  getCurrentBalance(): Promise<string> {
    return fetch(`${CAC_MINING}/api/v1/payouts/bitcoin`)
      .then((resp) => resp.text())
      .then((text) => {
        return text;
      });
  }

  getOSes(devVersion: string): Promise<OSResponse> {
    let URL = `https://mining.cloudatcocks.com/api/v1/platform/cloudpro-${devVersion}/operating-systems`;
    return fetch(URL)
      .then((resp) => resp.json())
      .then((json) => {
        return {
          oses: json,
        };
      });
  }
}
export default CloudatCocksClient;
