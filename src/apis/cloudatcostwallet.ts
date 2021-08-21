import { parse } from "node-html-parser";

export type MiningWalletTransaction = {
  minerID: string | undefined;
  packageID: string | undefined;
  minerType: string | undefined;
  amount: string | undefined;
  date: string | undefined;
  type: string | undefined;
};
export type MinerResponse = {
  miners: { [id: string]: string };
};
export type MiningWalletResponse = {
  transactions: MiningWalletTransaction[];
};
export type LoginResponse = {
  valid: boolean;
};

export const CAC_WALLET_URL = "https://wallet.cloudatcost.com";

export class CloudatCostWalletClient {
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
    return fetch(CAC_WALLET_URL).then((resp) => {
      // no redirection means we're logged in
      return resp.redirected === false;
    });
  }

  getCSRFToken(): Promise<string | undefined> {
    return fetch(`${CAC_WALLET_URL}/login`)
      .then((resp) => resp.text())
      .then((text) => {
        const dom = parse(text);
        const token = dom
          .querySelector("input[name='_csrf']")
          .getAttribute("value");
        return token;
      });
  }

  login(): Promise<LoginResponse> {
    const formData = new FormData();
    if (this.email && this.password) {
      return this.getCSRFToken().then((token) => {
        if (this.email && this.password && token) {
          formData.append("email", this.email);
          formData.append("password", this.password);
          formData.append("_csrf", token);
        }
        return fetch(`${CAC_WALLET_URL}/login`, {
          method: "POST",
          body: formData,
        }).then((resp) => {
          // check where we're redirected to
          if (
            resp.url === `${CAC_WALLET_URL}/` ||
            resp.url === CAC_WALLET_URL
          ) {
            this.loggedIn = true;
          }
          return {
            valid: this.loggedIn,
          };
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        resolve({
          valid: false,
        });
      });
    }
  }

  getMiners(): Promise<MinerResponse> {
    return fetch(`${CAC_WALLET_URL}/miner`)
      .then((resp) => resp.text())
      .then((text) => {
        const dom = parse(text);
        const miners: { [id: string]: string } = {};

        //const minerList = dom.querySelector(".align-self-center.ps-3");
        const minerList = dom.querySelectorAll(".content > .d-flex");
        for (const minerListItem of minerList) {
          if (minerListItem?.childNodes) {
            for (let minerEntry of minerListItem.childNodes) {
              // @ts-expect-error
              if (minerEntry.classNames === "align-self-center ps-3") {
                const text = minerEntry.text;
                const values = text
                  .replace(/\t/g, "")
                  .replace(/\r/g, "")
                  .replace(/-/g, "")
                  .split("\n")
                  .filter((a) => a.length > 0);
                const minerInfo = values[0].split("(");
                const minerID = minerInfo[1]
                  .split(":")[1]
                  .replace(")", "")
                  .trim();
                const minerType = minerInfo[0].trim();
                miners[minerID] = minerType;
              }
            }
          }
        }

        return {
          miners: miners,
        };
      });
  }

  async getMiningWalletDetails(): Promise<MiningWalletResponse> {
    // get miners
    const miners = await this.getMiners();
    return await fetch(`${CAC_WALLET_URL}/transaction`)
      .then((resp) => resp.text())
      .then((text) => {
        // parse text via HTML
        const dom = parse(text);
        const transactions: MiningWalletTransaction[] = [];

        const tbody = dom.querySelector(".list-group.list-custom-large");
        if (tbody?.childNodes) {
          for (let tr of tbody.childNodes) {
            if (tr.childNodes.length > 0) {
              const text = tr.text;
              const values = text
                .replace(/\t/g, "")
                .replace(/\r/g, "")
                .split("\n")
                .filter((a) => a.length > 0);
              const minerAction = values[0].split(" ");
              const minerID = minerAction[2]?.replace("(", "").replace(")", "");
              const minerType = miners.miners[minerID];
              const amount = values[2].split(" ")[0];
              const date = new Date(values[1])
                .toISOString()
                .replace("T", " ")
                .split(".")[0];
              const type = minerAction[0].toLowerCase();
              transactions.push({
                minerID: minerID ? minerID : "",
                packageID: "",
                minerType: minerType ? minerType : "",
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

  async getMiningWalletDepositDetails(): Promise<MiningWalletResponse> {
    const walletDetails = await this.getMiningWalletDetails();
    // reduce transactions to only deposits
    const deposits = walletDetails.transactions.filter((trans) => {
      return trans.type === "deposit";
    });
    return {
      transactions: deposits,
    };
  }
}
export default CloudatCostWalletClient;
