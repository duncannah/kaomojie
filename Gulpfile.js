const fs = require("fs-extra");
const path = require("path");

const { series, src, dest } = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const zip = require("gulp-zip");

const BUILDPATH = path.join(__dirname, "/build");

sass.compiler = require("node-sass");

async function clean() {
	await fs.emptyDir(BUILDPATH);
}

async function build() {
	// copy
	await (() =>
		new Promise((resv) =>
			src(["src/manifest.json"])
				.pipe(dest("build/"))
				.on("end", resv)
		))();
	await (() =>
		new Promise((resv) =>
			src(["src/popup.htm"])
				.pipe(dest("build/"))
				.on("end", resv)
		))();
	await (() =>
		new Promise((resv) =>
			src(["src/lib/*"])
				.pipe(dest("build/lib"))
				.on("end", resv)
		))();
	await (() =>
		new Promise((resv) =>
			src(["assets/**", "!assets/screenshots/**"])
				.pipe(dest("build/assets"))
				.on("end", resv)
		))();

	// transpile jsx
	await (() =>
		new Promise((resv) =>
			src(["src/popup.js"])
				.pipe(
					babel({
						presets: [
							[
								"@babel/preset-react",
								{
									pragma: "preact.createElement",
									pragmaFrag: "preact.Fragment"
								}
							]
						],
						plugins: [["@babel/plugin-proposal-class-properties"]]
					})
				)
				.pipe(dest("build/"))
				.on("end", resv)
		))();

	// transpile scss
	await (() =>
		new Promise((resv) =>
			src(["src/popup.scss"])
				.pipe(sass().on("error", sass.logError))
				.pipe(dest("build/"))
				.on("end", resv)
		))();

	// compile list
	let kaomojiList = {};

	await fs.readdir(path.join(__dirname, "/kaomojis")).then((files) => {
		files.forEach((file) => {
			let kaomojis = {};

			let currentCat = "";
			fs.readFileSync(path.join(__dirname, "/kaomojis", file))
				.toString()
				.split("\n")
				.forEach((line) => {
					if (line.startsWith("!!!!!!!!!!!!")) {
						currentCat = line.substr(12).trim();
						kaomojis[currentCat] = [];
					} else if (line.trim().length > 0) kaomojis[currentCat].push(line.trim());
				});

			kaomojiList[file.substr(3)] = kaomojis;
		});
	});

	await fs.writeFile(path.join(BUILDPATH, "/kaomojis.js"), "const KAOMOJIS = " + JSON.stringify(kaomojiList));
}

async function zipBuild() {
	await (() =>
		new Promise((resv) =>
			src("build/**")
				.pipe(zip("archive.zip"))
				.pipe(dest("build"))
				.on("end", resv)
		))();
}

exports.clean = clean;
exports.build = build;
exports.deploy = series(clean, build, zipBuild);

exports.default = series(clean, build);
