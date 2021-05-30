import { Component } from "react";
import CloudatCostWalletClient, {
  CAC_WALLET_URL,
} from "../apis/cloudatcostwallet";

type CloudatCostWalletLoginProps = {
  onLoginValid: (client: CloudatCostWalletClient) => void;
};
type CloudatCostWalletLoginState = {
  attemptedLogin: boolean;
  error?: string;
};

class CloudatCostWalletLogin extends Component<
  CloudatCostWalletLoginProps,
  CloudatCostWalletLoginState
> {
  constructor(props: CloudatCostWalletLoginProps) {
    super(props);
    this.state = {
      attemptedLogin: false,
      error: undefined,
    };
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  checkLoggedIn() {
    this.setState(
      {
        error: undefined,
      },
      async () => {
        // create client
        chrome.storage.local.get(
          ["cacWalletEmail", "cacWalletPassword"],
          async (result) => {
            let client = null;
            if (result.cacWalletEmail && result.cacWalletPassword) {
              client = new CloudatCostWalletClient(
                result.cacWalletEmail,
                result.cacWalletPassword
              );
            } else {
              client = new CloudatCostWalletClient();
            }
            // check if we're logged in
            let isLoggedIn = await client.isLoggedIn();

            // if not logged in and we have credentials, try to with provided credentials
            if (isLoggedIn === false && client.hasCredentials()) {
              const valid = await client.login();
              isLoggedIn = valid.valid;
              if (isLoggedIn === false) {
                this.setState({
                  error:
                    "Unable to login with the provided credentials, please verify they are correct and IP is whitelisted!",
                  attemptedLogin: true,
                });
              }
            }

            // if we're logged in, return the API client
            if (isLoggedIn === true) {
              this.props.onLoginValid(client);
            } else {
              this.setState({
                error:
                  "You do not have an active session or stored credentials.  Please verify on the website!",
                attemptedLogin: true,
              });
            }
          }
        );
      }
    );
  }
  componentDidMount() {
    this.checkLoggedIn();
  }

  render() {
    return (
      <div className="row text-center">
        {this.state.error && <p className="text-danger">{this.state.error}</p>}
        {this.state.attemptedLogin && (
          <div>
            <p>
              Please ensure you're logged in to the{" "}
              <a href={CAC_WALLET_URL} target="_blank" rel="noreferrer">
                CloudatCost Miner Panel
              </a>{" "}
              and click the below button for verification
            </p>
            <button
              className="btn btn-primary"
              onClick={() => this.checkLoggedIn()}
            >
              Verify Login
            </button>
          </div>
        )}
        {this.state.attemptedLogin === false &&
          this.state.error === undefined && (
            <p>Checking your login status with the CloudatCost Panel...</p>
          )}
      </div>
    );
  }
}
export default CloudatCostWalletLogin;
