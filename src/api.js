import { parse } from "node-html-parser";

type CloudatCostSettingsResponse = {
  name: string,
  email: string,
};

const CAC_URL = "https://panel.cloudatcost.com/panel/_config";
const api = {
  cloudatcost: {
    getSettings: (): Promise<CloudatCostSettingsResponse> => {
      return fetch(
        `https://panel.cloudatcost.com/panel/_config/userSettings.php`
      )
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
  },
};
export default api;
