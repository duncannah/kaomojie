import { rm, readdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { src as _src, dest, series } from "gulp";
import babel from "gulp-babel";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import zip from "gulp-zip";

const sass = gulpSass(dartSass);
const src = (arg: Parameters<typeof _src>[0]) => _src(arg, { encoding: false });

const BUILDPATH = join(import.meta.dirname, "build");

// Utility function to handle stream completion
const streamToPromise = (stream: NodeJS.ReadWriteStream) =>
	new Promise((resolve, reject) => stream.on("end", resolve).on("error", reject));

export async function clean() {
	await rm(BUILDPATH, { recursive: true, force: true });
}

export async function copyAssets() {
	await Promise.all([
		streamToPromise(src("src/_locales/**").pipe(dest(join(BUILDPATH, "_locales")))),
		streamToPromise(src("src/manifest.json").pipe(dest(BUILDPATH))),
		streamToPromise(src("src/popup.htm").pipe(dest(BUILDPATH))),
		streamToPromise(
			src(["assets/**", "!assets/screenshots/**"]).pipe(dest(join(BUILDPATH, "assets")))
		),
		streamToPromise(src("node_modules/preact/dist/preact.umd.js").pipe(dest(BUILDPATH))),
	]);
}

export async function transpileJSX() {
	await streamToPromise(
		src("src/popup.js")
			.pipe(
				babel({
					presets: [
						// @ts-ignore: typings are incorrect
						[
							"@babel/preset-react",
							{ pragma: "preact.createElement", pragmaFrag: "preact.Fragment" },
						],
					],
					plugins: ["@babel/plugin-transform-class-properties"],
				})
			)
			.pipe(dest(BUILDPATH))
	);
}

export async function compileSCSS() {
	await streamToPromise(
		src("src/popup.scss").pipe(sass().on("error", sass.logError)).pipe(dest(BUILDPATH))
	);
}

export async function compileKaomojis() {
	const files = await readdir(join(import.meta.dirname, "kaomojis"));
	const kaomojiList: Record<string, Record<string, string[]>> = {};

	for (const file of files) {
		const content = await readFile(join(import.meta.dirname, "kaomojis", file), "utf-8");
		const lines = content.split("\n");

		let currentCategory = "";
		const kaomojis: Record<string, string[]> = {};

		lines.forEach((line) => {
			if (line.startsWith("!!!!!!!!!!!!")) {
				currentCategory = line.substring(12).trim();
				kaomojis[currentCategory] = [];
			} else if (line.trim()) {
				kaomojis[currentCategory].push(line.trim());
			}
		});

		kaomojiList[file.substring(3)] = kaomojis;
	}

	const popupJsPath = join(BUILDPATH, "popup.js");
	const existingPopupJs = await readFile(popupJsPath, "utf-8");
	const newPopupJs = `const KAOMOJIS = ${JSON.stringify(kaomojiList)};\n${existingPopupJs}`;

	await writeFile(popupJsPath, newPopupJs);
}

export async function zipBuild() {
	await streamToPromise(src("build/**").pipe(zip("archive.zip")).pipe(dest(BUILDPATH)));
}

export const build = series(copyAssets, transpileJSX, compileSCSS, compileKaomojis);

export const deploy = series(clean, build, zipBuild);

export default series(clean, build);
