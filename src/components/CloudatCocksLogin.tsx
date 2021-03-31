import { Component } from "react";
import CloudatCocksClient, { CAC_MINING } from "../apis/cloudatcocks";

type CloudatCocksLoginProps = {
  onLoginValid: (client: CloudatCocksClient) => void;
};
type CloudatCocksLoginState = {
  attemptedLogin: boolean;
  error?: string;
};

class CloudatCocksLogin extends Component<
  CloudatCocksLoginProps,
  CloudatCocksLoginState
> {
  constructor(props: CloudatCocksLoginProps) {
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
        chrome.storage.local.get(
          ["cacMineEmail", "cacMinePassword"],
          async (result) => {
            let client = null;
            if (result.cacMineEmail && result.cacMinePassword) {
              client = new CloudatCocksClient(
                result.cacMineEmail,
                result.cacMinePassword
              );
            } else {
              client = new CloudatCocksClient();
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
              <a href={CAC_MINING} target="_blank" rel="noreferrer">
                CloudatCocks Panel
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
            <p>Checking your login status with the CloudatCocks Panel...</p>
          )}
      </div>
    );
  }
}
export default CloudatCocksLogin;
