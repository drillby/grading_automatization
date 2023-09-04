import fs from "fs";

const copyViews = () => {
	const views = fs.readdirSync("./src/views");
	// create dist/views folder
	if (!fs.existsSync("./dist/views")) {
		fs.mkdirSync("./dist/views");
	}
	views.forEach((view) => {
		fs.copyFileSync(`./src/views/${view}`, `./dist/views/${view}`);
	});
};

copyViews();
