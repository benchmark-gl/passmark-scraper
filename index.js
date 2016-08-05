const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

const pages = [
	'http://www.videocardbenchmark.net/high_end_gpus.html', 
	'http://www.videocardbenchmark.net/mid_range_gpus.html', 
	'http://www.videocardbenchmark.net/midlow_range_gpus.html',
	'http://www.videocardbenchmark.net/low_end_gpus.html'
];
let data = [];

let requests = pages.map(page => {
	return new Promise((resolve, reject) => {
		request(page, function (error, response, body) {
			if (error || response.statusCode !== 200) {
				reject(error, response.statusCode);
			} else {
				const $ = cheerio.load(body);
				const $rows = $('#mark tr');
				$rows.each((index, tr) => {
					const block = {};
					const gpu = $(tr).children('td').eq(0).children('a').text();
					const rating = $(tr).children('td').eq(1).children('.meter').text();
					if (gpu) {
						block.gpu = gpu;
						block.passmarkRating = rating;
						data.push(block);
					}
				});
				resolve();
			}
		});
	})
});

function scrape() {
	Promise.all(requests).then(() => {
		fs.writeFileSync('./output.json', JSON.stringify(data));
	})	
}