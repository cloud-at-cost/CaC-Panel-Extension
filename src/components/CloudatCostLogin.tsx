import { Component } from "react";
import api from "../api";

type CloudatCostLoginProps = {
  onLoginValid: () => void;
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
      error: null,
    };
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  checkLoggedIn() {
    this.setState(
      {
        error: null,
      },
      () => {
        fetch(api.cloudatcost.URL).then((resp) => {
          // if we were redirected, they need to login!
          if (resp.redirected === true) {
            // check if we have credentials already stored
            chrome.storage.local.get(["cacEmail", "cacPassword"], (result) => {
              if (result.cacEmail && result.cacPassword) {
                // login for the user
                api.cloudatcost
                  .login(result.cacEmail, result.cacPassword)
                  .then((resp) => {
                    // check if valid login
                    if (resp.valid) {
                      this.checkLoggedIn();
                    } else {
                      this.setState({
                        error:
                          "Unable to login with the provided credentials, please verify they are correct and IP is whitelisted!",
                        attemptedLogin: true,
                      });
                    }
                  });
              } else {
                // mark attempt and wait for user
                this.setState({
                  attemptedLogin: true,
                });
              }
            });
          } else {
            // let parent know we're logged in
            api.cloudatcost.getSettings().then((user) => {
              this.props.onLoginValid(user);
            });
          }
        });
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
              Please ensure you're logged in to the CloudatCost Panel and click
              the below button for verification
            </p>
            <button
              className="btn btn-primary"
              onClick={() => this.checkLoggedIn()}
            >
              Verify Login
            </button>
          </div>
        )}
        {this.state.attemptedLogin === false && this.state.error === null && (
          <p>Checking your login status with the CloudatCost Panel...</p>
        )}
      </div>
    );
  }
}
export default CloudatCostLogin;
