import { parse } from "node-html-parser";

export type SettingsResponse = {
  name: string | undefined;
  email: string | undefined;
};
export type MiningWalletTransaction = {
  minerID: string | undefined;
  packageID: string | undefined;
  minerType: string | undefined;
  amount: string | undefined;
  date: string | undefined;
  type: string | undefined;
};
export type MiningWalletResponse = {
  transactions: MiningWalletTransaction[];
};
export type LoginResponse = {
  valid: boolean;
};
export type Server = {
  name: string;
  id: string;
};
export type ServersResponse = {
  servers: Server[];
};

export const CAC_URL = "https://panel.cloudatcost.com";
export const CAC_CONFIG_URL = `${CAC_URL}/panel/_config`;

export class CloudatCostClient {
  email?: string;
  password?: string;
  loggedIn: boolean;
  accountID?: string;

  constructor(email?: string, password?: string) {
    this.email = email;
    this.password = password;
    this.loggedIn = false;
  }

  hasCredentials(): boolean {
    return this.email !== null && this.password !== null;
  }

  isLoggedIn(): Promise<boolean> {
    return fetch(CAC_URL).then((resp) => {
      // no redirection means we're logged in
      return resp.redirected === false;
    });
  }

  login(): Promise<LoginResponse> {
    const formData = new FormData();
    if (this.email && this.password) {
      formData.append("username", this.email);
      formData.append("password", this.password);
      formData.append("failedpage", "login-failed-2.php");
      formData.append("submit", "Login");
      return fetch(`${CAC_URL}/manage-check2.php`, {
        method: "POST",
        body: formData,
      }).then((resp) => {
        // check where we're redirected to
        if (resp.url === `${CAC_URL}/` || resp.url === CAC_URL) {
          this.loggedIn = true;
        }
        return {
          valid: this.loggedIn,
        };
      });
    } else {
      return new Promise((resolve, reject) => {
        resolve({
          valid: false,
        });
      });
    }
  }

  getAccountID(): Promise<string | undefined> {
    return fetch(`${CAC_URL}/script`)
      .then((resp) => resp.text())
      .then((text) => {
        // parse text via HTML
        const dom = parse(text);
        const accountID = dom
          .querySelector("input[name='cid']")
          .getAttribute("value");
        // save account ID
        this.accountID = accountID;
        return accountID;
      });
  }

  getServers(): Promise<ServersResponse> {
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
  }

  async deleteServer(serverID: string) {
    // check if we need to get our account ID
    let accountID = this.accountID;
    if (accountID === undefined) {
      accountID = await this.getAccountID();
    }
    return fetch(
      `${CAC_CONFIG_URL}/serverdeletecloudpro.php?cid=${accountID}&sid=${serverID}&svn=undefined&reserve=false`
    );
  }

  getSettings(): Promise<SettingsResponse> {
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
  }

  getMiningWalletDetails(): Promise<MiningWalletResponse> {
    return fetch(`${CAC_URL}/wallet`)
      .then((resp) => resp.text())
      .then((text) => {
        // parse text via HTML
        const dom = parse(text);
        const transactions: MiningWalletTransaction[] = [];

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
  }
}
export default CloudatCostClient;
