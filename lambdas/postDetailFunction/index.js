const AWS = require('aws-sdk');
const marked = require('marked');
const moment = require('moment');
const Mustache = require('mustache');
const fs = require('fs');
const zlib = require('zlib');
const _ = require('lodash');

const dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {

    const yearMonth = parseInt(event.year) * 100 + parseInt(event.month);

	var params = {
		TableName: 'Posts',
		Key: {
		    "yearMonth": {N: yearMonth.toString()},
		    "url": {S: '/' + event.year + '/' + event.month + '/' + event.postTitle}
		}
	};
	dynamodb.getItem(params).promise()
		.then(function(data) {

			return data.Item;
		})
		.then(function(postContent) {

			const post = {
				postTitle: postContent.postTitle.S,
				postContent: marked(postContent.postContent.S),
				publicationDate: moment(postContent.publicationDate.N.toString(), "YYYYMMDD").format("Do MMMM YYYY")
			};

			fs.readFile('./templates/postDetail.tmpl', function(err, content) {
				if(err) context.fail(err);
				var output = Mustache.render(content.toString(), post);
				console.log(output);
				zlib.gzip(output, function(error, gzipped) {
					if(error) context.fail(error);
					context.succeed(gzipped.toString('base64'));
				});
			});
		})
		.catch(function(err) {
			context.fail(err);
		});

};
