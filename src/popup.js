document.documentElement.lang = chrome.i18n.getMessage("lang");

const CategoryList = ({ categories, curCat, onChangeCat }) => (
	<div className="categories">
		{categories.map((cat) => (
			<li
				key={cat}
				className={curCat === cat ? "active" : ""}
				onClick={() => onChangeCat(cat)}
			>
				{chrome.i18n.getMessage(`category__${cat}`) || cat}
			</li>
		))}
	</div>
);

const SubCategoryList = ({ subCategories, curSub, onChangeSub }) => (
	<div className="sub-categories">
		{subCategories.map((subCat) => (
			<li
				key={subCat}
				className={curSub === subCat ? "active" : ""}
				onClick={() => onChangeSub(subCat)}
			>
				{chrome.i18n.getMessage(`subCategory__${subCat}`) || subCat}
			</li>
		))}
	</div>
);

const KaomojiList = ({ kaomojis }) => (
	<div className="scroll-area">
		<div className="kaomojis">
			{kaomojis.map((kaomoji, i) => (
				<li key={i} onMouseDown={() => navigator.clipboard.writeText(kaomoji)}>
					{kaomoji}
				</li>
			))}
		</div>
	</div>
);

const InfoPanel = ({ showInfo, toggleInfo }) => (
	<div className={"info" + (showInfo ? " show" : "")}>
		<div className="info-close" onClick={toggleInfo}>
			✕
		</div>
		<div className="info-content">
			<div className="info-title">kaomojie</div>
			<div className="info-version">
				{chrome.i18n.getMessage(
					"version",
					chrome.runtime ? chrome.runtime.getManifest().version : "..."
				)}
			</div>
			<p>
				{chrome.i18n.getMessage("sourceCodeDisclaimer")}
				<br />
				<a
					href="https://github.com/duncannah/kaomojie"
					rel="noopener noreferrer"
					target="_blank"
				>
					https://github.com/duncannah/kaomojie
				</a>
			</p>
		</div>
	</div>
);

class App extends preact.Component {
	constructor(props) {
		super(props);
		this.state = {
			curCat: Object.keys(KAOMOJIS)[0],
			curSub: Object.keys(KAOMOJIS[Object.keys(KAOMOJIS)[0]])[0],
			showInfo: false,
		};
	}

	componentDidMount() {
		chrome.storage.local.get(["curCat", "curSub"], (res) => {
			if (res.curCat) this.setState({ curCat: res.curCat, curSub: res.curSub });
		});
	}

	componentDidUpdate(_, prevState) {
		if (prevState.curSub !== this.state.curSub) {
			document.getElementsByClassName("scroll-area")[0].scrollTo(0, 0);
		}
	}

	changeCat = (cat) => {
		const newSub = Object.keys(KAOMOJIS[cat])[0];
		this.setState({ curCat: cat, curSub: newSub });
		chrome.storage.local.set({ curCat: cat, curSub: newSub });
	};

	changeSub = (subCat) => {
		this.setState({ curSub: subCat });
		chrome.storage.local.set({ curCat: this.state.curCat, curSub: subCat });
	};

	toggleInfo = () => {
		this.setState({ showInfo: !this.state.showInfo });
	};

	render() {
		const { curCat, curSub, showInfo } = this.state;
		const categories = Object.keys(KAOMOJIS);
		const subCategories = Object.keys(KAOMOJIS[curCat]);
		const kaomojis = KAOMOJIS[curCat][curSub];

		return (
			<>
				<div className="info-btn" onClick={this.toggleInfo}>
					kaomojie
				</div>
				<CategoryList
					categories={categories}
					curCat={curCat}
					onChangeCat={this.changeCat}
				/>
				<SubCategoryList
					subCategories={subCategories}
					curSub={curSub}
					onChangeSub={this.changeSub}
				/>
				<KaomojiList kaomojis={kaomojis} />
				<InfoPanel showInfo={showInfo} toggleInfo={this.toggleInfo} />
			</>
		);
	}
}

preact.render(<App />, document.getElementById("app"));
