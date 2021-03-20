import { Component } from 'react';

type CloudatCostMinerProps = {};
type CloudatCostMinerState = {};

class CloudatCostMiner extends Component<CloudatCostMinerProps, CloudatCostMinerState> {
	constructor(props: CloudatCostMinerProps) {
		super(props);
		this.getCurrentMinerStats = this.getCurrentMinerStats.bind(this);
	}

	getCurrentMinerStats() {
	}

	render() {
		return (
			<div className="row">
				<button className="btn btn-primary" onClick={() => this.getCurrentMinerStats()}>Get Current Stats</button>
			</div>
		);
	}
}
export default CloudatCostMiner;
