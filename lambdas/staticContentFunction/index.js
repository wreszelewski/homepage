const AWS = require('aws-sdk');
const Mustache = require('mustache');
const fs = require('fs');
const zlib = require('zlib');

const dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {


	Promise.resolve(function() {

		return event.path.replace('/', '').replace("html", "tmpl");

	}())

		.then(function(fileName) {


			fs.readFile('./templates/' + fileName, function(err, content) {
				if(err) context.fail(err);
				var output = Mustache.render(content.toString(), {});
				if(event.headers && event.headers['Accept-Encoding'] && event.headers['Accept-Encoding'].indexOf('gzip') !== -1) {
					zlib.gzip(output, function(error, gzipped) {
						if(error) context.fail(error);
						context.succeed({
							statusCode: 200,
							body: gzipped.toString('base64'),
							isBase64Encoded: true,
							headers: {
								'Content-Type': 'text/html',
								'Content-Encoding': 'gzip',
								'Vary': 'Accept-Encoding'
							}
						});
					});
				} else {
					context.succeed({
						statusCode: 200,
						body: (new Buffer(output)).toString('base64'),
						isBase64Encoded: true,
						headers: {
							'Content-Type': 'text/html',
							'Vary': 'Accept-Encoding'
						}
					});
				}
			});
		})
		.catch(function(err) {
			context.fail(err);
		});

};
