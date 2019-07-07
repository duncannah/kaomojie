class App extends preact.Component {
	constructor(props) {
		super(props);

		this.state = {
			curCat: Object.keys(KAOMOJIS)[0],
			curSub: Object.keys(KAOMOJIS[Object.keys(KAOMOJIS)[0]])[0],

			showInfo: false
		};
	}

	componentDidMount = () => {
		chrome.storage.local.get(["curCat", "curSub"], (res) => {
			if (res.curCat) this.setState({ curCat: res.curCat, curSub: res.curSub });
		});
	};

	componentDidUpdate = () => {
		document.getElementsByClassName("scroll-area")[0].scrollTo(0, 0);
	};

	_changeCat = (c) => {
		this.setState({ curCat: c, curSub: Object.keys(KAOMOJIS[c])[0] });

		chrome.storage.local.set({ curCat: c, curSub: Object.keys(KAOMOJIS[c])[0] });
	};

	_changeSub = (c) => {
		this.setState({ curSub: c });

		chrome.storage.local.set({ curCat: this.state.curCat, curSub: c });
	};

	_toggleInfo = () => {
		this.setState({ showInfo: !this.state.showInfo });
	};

	render = () => {
		return (
			<>
				<div className="info-btn" onClick={this._toggleInfo}>
					kaomojie
				</div>
				<div className="categories">
					{Object.keys(KAOMOJIS).map((c) => (
						<li
							key={c}
							className={this.state.curCat === c ? "active" : ""}
							onClick={() => this._changeCat(c)}>
							{c}
						</li>
					))}
				</div>
				<div className="scroll-area">
					<div className="sub-categories">
						{Object.keys(KAOMOJIS[this.state.curCat]).map((c) => (
							<li
								key={c}
								className={this.state.curSub === c ? "active" : ""}
								onClick={() => this._changeSub(c)}>
								{c}
							</li>
						))}
					</div>
					<div className="kaomojis">
						{KAOMOJIS[this.state.curCat][this.state.curSub].map((c, i) => (
							<li
								key={this.state.curCat + this.state.curSub + i}
								onClick={() => navigator.clipboard.writeText(c)}>
								{c}
							</li>
						))}
					</div>
				</div>

				<div className={"info" + (this.state.showInfo ? " show" : "")}>
					<div className="info-close" onClick={this._toggleInfo}>
						✕
					</div>
					<div className="info-content">
						<div className="info-title">kaomojie</div>
						<div className="info-version">
							version {chrome.runtime ? chrome.runtime.getManifest().version : "..."}
						</div>
						<p>
							Source code available under AGPL 3.0:
							<br />
							<a href="https://github.com/duncannah/kaomojie" rel="noopener noreferrer" target="_blank">
								https://github.com/duncannah/kaomojie
							</a>
						</p>
						{/*<p>({navigator.platform === "MacIntel" ? "⌘" : "Ctrl"} + click to open)</p>*/}
					</div>
				</div>
			</>
		);
	};
}

preact.render(<App />, document.getElementById("app"));
