import { readFileSync } from "node:fs";
import { rm, readdir, writeFile, readFile } from "node:fs/promises";
import { join } from "path";

import { series, src, dest } from "gulp";
import babel from "gulp-babel";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import zip from "gulp-zip";

const sass = gulpSass(dartSass);

const BUILDPATH = join(import.meta.dirname, "build");

export async function clean() {
	await rm(BUILDPATH, { recursive: true, force: true });
}

export async function build() {
	await Promise.all([
		(() =>
			new Promise((resv) =>
				src(["src/manifest.json"]).pipe(dest("build/")).on("end", resv)
			))(),
		(() =>
			new Promise((resv) => src(["src/popup.htm"]).pipe(dest("build/")).on("end", resv)))(),
		(() => new Promise((resv) => src(["src/lib/*"]).pipe(dest("build/lib")).on("end", resv)))(),
		(() =>
			new Promise((resv) =>
				src(["assets/**", "!assets/screenshots/**"])
					.pipe(dest("build/assets"))
					.on("end", resv)
			))(),
		(() =>
			new Promise((resv) =>
				src(["node_modules/preact/dist/preact.umd.js"]).pipe(dest("build")).on("end", resv)
			))(),
	]);

	// transpile jsx
	await (() =>
		new Promise((resv) =>
			src(["src/popup.js"])
				.pipe(
					babel({
						presets: [
							// @ts-ignore
							[
								"@babel/preset-react",
								{
									pragma: "preact.createElement",
									pragmaFrag: "preact.Fragment",
								},
							],
						],
						// @ts-ignore
						plugins: [["@babel/plugin-transform-class-properties"]],
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
	let kaomojiList: Record<string, Record<string, string[]>> = {};

	await readdir(join(import.meta.dirname, "/kaomojis")).then((files) => {
		files.forEach((file) => {
			let kaomojis: Record<string, string[]> = {};

			let currentCat = "";
			readFileSync(join(import.meta.dirname, "/kaomojis", file))
				.toString()
				.split("\n")
				.forEach((line) => {
					if (line.startsWith("!!!!!!!!!!!!")) {
						currentCat = line.substring(12).trim();
						kaomojis[currentCat] = [];
					} else if (line.trim().length > 0) kaomojis[currentCat].push(line.trim());
				});

			kaomojiList[file.substring(3)] = kaomojis;
		});
	});

	await writeFile(
		join(BUILDPATH, "/popup.js"),
		"const KAOMOJIS = " +
			JSON.stringify(kaomojiList) +
			";\n" +
			(await readFile(join(BUILDPATH, "/popup.js")))
	);
}

async function zipBuild() {
	await (() =>
		new Promise((resv) =>
			src("build/**").pipe(zip("archive.zip")).pipe(dest("build")).on("end", resv)
		))();
}

export const deploy = series(clean, build, zipBuild);

export default series(clean, build);
