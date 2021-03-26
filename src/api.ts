import { parse } from "node-html-parser";

type CloudatCostSettingsResponse = {
  name: string | undefined;
  email: string | undefined;
};
type CloudatCostMiningWalletTransaction = {
  minerID: string | undefined;
  packageID: string | undefined;
  minerType: string | undefined;
  amount: string | undefined;
  date: string | undefined;
  type: string | undefined;
};
type CloudatCostMiningWalletResponse = {
  transactions: CloudatCostMiningWalletTransaction[];
};
type CloudatCostLoginResponse = {
  valid: boolean;
};
type CloudatCostServer = {
  name: string;
  id: string;
};
type CloudatCostServersResponse = {
  servers: CloudatCostServer[];
};

type CloudatCocksPayoutResponse = {};
type CloudatCocksLoginResponse = CloudatCostLoginResponse;

type SheetsOS = {
  name: string;
  id: string;
};
type SheetsOSResponse = {
  oses: SheetsOS[];
};

const CAC_CONFIG_URL = "https://panel.cloudatcost.com/panel/_config";
const CAC_URL = "https://panel.cloudatcost.com";
const CAC_MINING = "https://mining.cloudatcocks.com";
const CAC_OS_SHEET = (tab: number) =>
  `https://spreadsheets.google.com/feeds/list/1DH8evGlJ8sZ6CU3Iy23TeHzMbfLV8bCQFmXtr7YwydQ/${tab}/public/values?alt=json`;

const api = {
  sheets: {
    OS_URL:
      "https://docs.google.com/spreadsheets/d/1DH8evGlJ8sZ6CU3Iy23TeHzMbfLV8bCQFmXtr7YwydQ",
    getOS: (devVersion: string): Promise<SheetsOSResponse> => {
      let sheetId = 1;
      if (devVersion == "1") {
        sheetId = 1;
      } else if (devVersion == "3") {
        sheetId = 2;
      } else if (devVersion == "4") {
        sheetId = 3;
      }
      return fetch(CAC_OS_SHEET(sheetId))
        .then((resp) => resp.json())
        .then((json) => {
          // parse OSes
          const oses = [];
          for (let entry of json.feed.entry) {
            const osName = entry["gsx$osname"]["$t"];
            const osId = entry["gsx$osid"]["$t"];
            oses.push({
              name: osName,
              id: osId,
            });
          }
          return {
            oses: oses,
          };
        });
    },
  },
  cloudatcocks: {
    URL: CAC_MINING,
    login: (
      email: string,
      password: string,
      token: string
    ): Promise<CloudatCocksLoginResponse> => {
      const loginData = {
        email: email,
        password: password,
      };
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
    },
    getCSRFToken: (): Promise<string | undefined> => {
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
      const payoutsData = { payouts: payouts.transactions };
      return fetch(`${CAC_MINING}/payouts/create`, {
        method: "POST",
        body: JSON.stringify(payoutsData),
        headers: {
          "X-CSRF-TOKEN": token,
          "content-type": "application/json",
        },
      });
      // TODO: It seems a 409 is just thrown (even for valid requests)
    },
    getCurrentBalance: (): Promise<string | undefined> => {
      return fetch(`${CAC_MINING}/api/v1/payouts/bitcoin`)
        .then((resp) => resp.text())
        .then((text) => {
          return text;
        });
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
    getAccountID: (): Promise<string | undefined> => {
      return fetch(`${CAC_URL}/script`)
        .then((resp) => resp.text())
        .then((text) => {
          // parse text via HTML
          const dom = parse(text);
          const accountID = dom
            .querySelector("input[name='cid']")
            .getAttribute("value");
          return accountID;
        });
    },
    getServers: (): Promise<CloudatCostServersResponse> => {
      return fetch(CAC_URL)
        .then((resp) => resp.text())
        .then((text) => {
          // parse text via HTML
          const dom = parse(text);
          // This is messy because C@C can't be bothered to have valid HTML and the parser interprets it weirdly
          const tds = dom.querySelectorAll("td");
          const servers = [];
          for (let td of tds) {
            // check for ID field to figure out if this table is for a server
            if (td.id?.indexOf("PanelTitle") !== -1) {
              // extract ID
              const serverID = td.id?.split("_")[1];
              const serverName = td.innerText?.replace(/&nbsp;/gi, "");
              if (serverID) {
                servers.push({
                  name: serverName,
                  id: serverID,
                });
              }
            }
          }
          return {
            servers: servers,
          };
        });
    },
    deleteServer: (accountID: string, serverID: string) => {
      return fetch(
        `${CAC_CONFIG_URL}/serverdeletecloudpro.php?cid=${accountID}&sid=${serverID}&svn=undefined&reserve=false`
      );
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
