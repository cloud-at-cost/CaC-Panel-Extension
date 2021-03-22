import { Component } from "react";
import api from "../api";

type CloudatCocksLoginProps = {
  onLoginValid: () => void;
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
        fetch(`${api.cloudatcocks.URL}/login`).then((resp) => {
          // if we were redirected, they need to login!
          if (resp.redirected === true) {
            // get CSRF token for session
            api.cloudatcocks.getCSRFToken().then((token) => {
              // let parent know we're logged in
              this.props.onLoginValid(token);
            });
          } else {
            // attempt to login if we have saved credential
            chrome.storage.local.get(
              ["cacMineEmail", "cacMinePassword"],
              (result) => {
                if (result.cacMineEmail && result.cacMinePassword) {
                  api.cloudatcocks.getCSRFToken().then((token) => {
                    api.cloudatcocks
                      .login(result.cacMineEmail, result.cacMinePassword, token)
                      .then((user) => {
                        if (user.valid) {
                          this.checkLoggedIn();
                        } else {
                          this.setState({
                            error: "Invalid saved credentials!",
                            attemptedLogin: true,
                          });
                        }
                      });
                  });
                } else {
                  // mark attempt and wait for user
                  this.setState({
                    attemptedLogin: true,
                  });
                }
              }
            );
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
              Please ensure you're logged in to the{" "}
              <a href={api.cloudatcocks.URL} target="_blank">
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
        {this.state.attemptedLogin === false && this.state.error === null && (
          <p>Checking your login status with the CloudatCocks Panel...</p>
        )}
      </div>
    );
  }
}
export default CloudatCocksLogin;
