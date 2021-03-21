import { Component } from "react";
import CloudatCocksLogin from "./CloudatCocksLogin";
import api from "../api";

type CloudatCostMinerProps = {};
type CloudatCostMinerState = {
  cloudatCocksToken?: string;
  payoutSubmitted: boolean;
  error?: string;
};

class CloudatCostMiner extends Component<
  CloudatCostMinerProps,
  CloudatCostMinerState
> {
  constructor(props: CloudatCostMinerProps) {
    super(props);
    this.state = {
      cloudatCocksToken: null,
      payoutSubmitted: false,
      error: null,
    };
    this.getCurrentMinerStats = this.getCurrentMinerStats.bind(this);
    this.handleCloudatCocksLogin = this.handleCloudatCocksLogin.bind(this);
  }

  handleCloudatCocksLogin(token) {
    this.setState({
      cloudatCocksToken: token,
    });
  }

  getCurrentMinerStats() {
    this.setState(
      {
        payoutSubmitted: false,
        error: null,
      },
      () => {
        api.cloudatcost.getMiningWalletDetails().then((wallet) => {
          console.log("Found transactions:", wallet);
          if (wallet.transactions.length > 0) {
            api.cloudatcocks.savePayout(wallet, this.state.cloudatCocksToken);
            this.setState({
              payoutSubmitted: true,
            });
          } else {
            this.setState({
              error: "No transactions found!",
            });
          }
        });
      }
    );
  }

  render() {
    return (
      <div className="row">
        {this.state.cloudatCocksToken === null && (
          <CloudatCocksLogin onLoginValid={this.handleCloudatCocksLogin} />
        )}
        {this.state.cloudatCocksToken !== null && (
          <div className="col-md-6 col-md-offset-3 text-center">
            {this.state.error && (
              <p className="text-center text-danger">{this.state.error}</p>
            )}
            <button
              className="btn btn-primary"
              onClick={() => this.getCurrentMinerStats()}
            >
              Forward Transactions to Panel
            </button>
            {this.state.payoutSubmitted === true && (
              <p className="text-success">
                Your transactions have been forwarded to the panel...
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
}
export default CloudatCostMiner;
