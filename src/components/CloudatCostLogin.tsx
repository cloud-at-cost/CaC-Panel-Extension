import { Component } from "react";
import CloudatCostClient, { CAC_URL } from "../apis/cloudatcost";

type CloudatCostLoginProps = {
  onLoginValid: (client: CloudatCostClient) => void;
};
type CloudatCostLoginState = {
  attemptedLogin: boolean;
  error?: string;
};

class CloudatCostLogin extends Component<
  CloudatCostLoginProps,
  CloudatCostLoginState
> {
  constructor(props: CloudatCostLoginProps) {
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
          ["cacEmail", "cacPassword"],
          async (result) => {
            let client = null;
            if (result.cacEmail && result.cacPassword) {
              client = new CloudatCostClient(
                result.cacEmail,
                result.cacPassword
              );
            } else {
              client = new CloudatCostClient();
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
              <a href={CAC_URL} target="_blank">
                CloudatCost Panel
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
export default CloudatCostLogin;
