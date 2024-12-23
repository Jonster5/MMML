const CLIENT_BASE = new URL(process.env.CLIENT_BASE_URL ?? "../client/");

const server = Bun.serve({
	development: true,
	static: {
		"/": new Response(
			await Bun.file(new URL("./index.html", CLIENT_BASE)).bytes(),
			{
				status: 200,
				headers: {
					"Content-Type": "text/html",
				},
			},
		),
		"/favicon.ico": new Response(
			await Bun.file(new URL("./favicon.ico", CLIENT_BASE)).bytes(),
			{
				status: 200,
				headers: {
					"Content-Type": "image/x-icon",
				},
			},
		),
	},
	port: 8000,
	fetch: async (request) => {
		let match = request.url.match(
			/\/client\/([a-zA-Z0-9_\-]*)\.(js|css|png|jpg)/,
		);
		let file_name = match[1];
		let file_type = match[2];
		let content_type = getContentType(file_type);
		let dir_name = getDirName(file_type);

		if (content_type === null || dir_name === null) {
			return Response("my bad", { status: 404 });
		}

		let file_url = new URL(
			`./${dir_name}/${file_name}.${file_type}`,
			CLIENT_BASE,
		);
		let file = Bun.file(file_url);

		if (!(await file.exists())) {
			return Response("my bad", { status: 404 });
		}

		return Response(await file.bytes(), {
			status: 200,
			headers: { "Content-Type": content_type },
		});
	},
});

function getContentType(file_type) {
	switch (file_type) {
		case "js":
			return "text/javascript";
		case "css":
			return "text/css";
		default:
			return null;
	}
}

function getDirName(file_type) {
	switch (file_type) {
		case "js":
			return "js";
		case "css":
			return "css";
		case "png":
		case "jpg":
			return "images";
		default:
			return null;
	}
}
