import { parse } from "node-html-parser";

type CloudatCostSettingsResponse = {
  name: string,
  email: string,
};
type CloudatCostMiningWalletTransaction = {
  minerID: string,
  packageID: string,
  minerType: string,
  amount: string,
  date: string,
  type: string,
};
type CloudatCostMiningWalletResponse = {
  transactions: CloudatCostMiningWalletTransaction[],
};
type CloudatCostLoginResponse = {
  valid: boolean,
};
type CloudatCocksPayoutResponse = {};

const CAC_CONFIG_URL = "https://panel.cloudatcost.com/panel/_config";
const CAC_URL = "https://panel.cloudatcost.com";
const CAC_MINING = "https://mining.cloudatcocks.com";
const api = {
  cloudatcocks: {
    URL: CAC_MINING,
    getCSRFToken: (): Promise<string> => {
      return fetch(`${CAC_MINING}/login`)
        .then((resp) => resp.text())
        .then((text) => {
          const dom = parse(text);
          const token = dom
            .querySelector("meta[name='csrf-token']")
            .getAttribute("content");
          return token;
        });
    },
    savePayout: (
      payouts: CloudatCostMiningWalletResponse,
      token: string
    ): Promise<CloudatCocksPayoutResponse> => {
      payouts = { payouts: payouts.transactions };
      return fetch(`${CAC_MINING}/payouts/create`, {
        method: "POST",
        body: JSON.stringify(payouts),
        headers: {
          "X-CSRF-TOKEN": token,
          "content-type": "application/json",
        },
      });
      // TODO: It seems a 409 is just thrown (even for valid requests)
    },
  },
  cloudatcost: {
    URL: CAC_URL,
    login: (
      email: string,
      password: string
    ): Promise<CloudatCostLoginResponse> => {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      formData.append("failedpage", "login-failed-2.php");
      formData.append("submit", "Login");
      return fetch(`${CAC_URL}/manage-check2.php`, {
        method: "POST",
        body: formData,
      }).then((resp) => {
        // check where we're redirected to
        return {
          valid: resp.url === CAC_URL,
        };
      });
    },
    getSettings: (): Promise<CloudatCostSettingsResponse> => {
      return fetch(`${CAC_CONFIG_URL}/userSettings.php`)
        .then((resp) => resp.text())
        .then((text) => {
          // parse text via HTML
          const dom = parse(text);
          const name = dom.querySelector("#Name").getAttribute("value");
          const email = dom.querySelector("#email").getAttribute("value");
          return {
            name: name,
            email: email,
          };
        });
    },
    getMiningWalletDetails: (): Promise<CloudatCostMiningWalletResponse> => {
      return fetch(`${CAC_URL}/wallet`)
        .then((resp) => resp.text())
        .then((text) => {
          // parse text via HTML
          const dom = parse(text);
          const transactions: CloudatCostMiningWalletTransaction[] = [];

          const tbody = dom.querySelector("tbody");
          if (tbody?.childNodes) {
            for (let tr of tbody.childNodes) {
              if (tr.childNodes.length > 0) {
                const minerID = tr.childNodes[1].text;
                const packageID = tr.childNodes[3].text;
                const minerType = tr.childNodes[5].text;
                const amount = tr.childNodes[7].text;
                const date = tr.childNodes[9].text;
                const type = tr.childNodes[11].text;
                transactions.push({
                  minerID: minerID,
                  packageID: packageID,
                  minerType: minerType,
                  amount: amount,
                  date: date,
                  type: type,
                });
              }
            }
          }

          return {
            transactions: transactions,
          };
        });
    },
  },
};
export default api;
