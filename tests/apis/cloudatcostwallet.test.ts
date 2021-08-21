import CloudatCostWalletClient from "../../src/apis/cloudatcostwallet";
import { readFileSync } from "fs";
import path from "path";

let minerResponse = "";
let transactionsResponse = "";

describe("CloudAtCost Wallet", () => {
  beforeAll(() => {
    minerResponse = readFileSync(path.join(__dirname, "miner.html"));
    transactionsResponse = readFileSync(
      path.join(__dirname, "transaction.html")
    );
  });

  test("Parses miners successfully", async () => {
    const expectedMiners = {
      miners: {
        "1": "M1a Miner",
        "2": "M1b Miner",
      },
    };

    // mock miner response
    fetchMock.mockOnce(minerResponse);
    const client = new CloudatCostWalletClient();

    // run function under test
    const miners = await client.getMiners();

    // check results
    expect(miners).toEqual(expectedMiners);
  });

  test("Parses all transactions successfully", async () => {
    const expectedTransactions = {
      transactions: [
        {
          minerID: "",
          minerType: "",
          amount: "0.00101399",
          date: "2021-06-18 19:26:00",
          type: "withdraw",
        },
        {
          minerID: "",
          minerType: "",
          amount: "0.06590966",
          date: "2021-06-18 19:25:00",
          type: "withdraw",
        },
        {
          minerID: "1",
          minerType: "M1a Miner",
          amount: "0.00003060",
          date: "2021-06-18 16:01:00",
          type: "deposit",
        },
        {
          minerID: "2",
          minerType: "M1b Miner",
          amount: "0.00003000",
          date: "2021-06-18 16:01:00",
          type: "deposit",
        },
      ],
    };

    // mock miner response
    fetchMock.mockOnce(minerResponse);
    // then the transaction response
    fetchMock.mockOnce(transactionsResponse);
    const client = new CloudatCostWalletClient();

    // run function under test
    const transactions = await client.getMiningWalletDetails();

    // check results
    transactions.transactions.forEach((tran) =>
      expect(expectedTransactions.transactions).toContainEqual(tran)
    );
  });

  test("Parses only deposit transactions successfully", async () => {
    const expectedTransactions = {
      transactions: [
        {
          minerID: "1",
          minerType: "M1a Miner",
          amount: "0.00003060",
          date: "2021-06-18 16:01:00",
          type: "deposit",
        },
        {
          minerID: "2",
          minerType: "M1b Miner",
          amount: "0.00003000",
          date: "2021-06-18 16:01:00",
          type: "deposit",
        },
      ],
    };

    // mock miner response
    fetchMock.mockOnce(minerResponse);
    // then the transaction response
    fetchMock.mockOnce(transactionsResponse);
    const client = new CloudatCostWalletClient();

    // run function under test
    const transactions = await client.getMiningWalletDepositDetails();

    // check results
    transactions.transactions.forEach((tran) =>
      expect(expectedTransactions.transactions).toContainEqual(tran)
    );
  });
});
