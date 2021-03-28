export type OS = {
  name: string;
  id: string;
};
export type OSResponse = {
  oses: OS[];
};

export const CAC_OS_SHEET = (tab: number) =>
  `https://spreadsheets.google.com/feeds/list/1DH8evGlJ8sZ6CU3Iy23TeHzMbfLV8bCQFmXtr7YwydQ/${tab}/public/values?alt=json`;
export const OS_URL =
  "https://docs.google.com/spreadsheets/d/1DH8evGlJ8sZ6CU3Iy23TeHzMbfLV8bCQFmXtr7YwydQ";

export class SheetsClient {
  constructor() {}

  getOS(devVersion: string): Promise<OSResponse> {
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
  }
}
export default SheetsClient;
