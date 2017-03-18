'use strict'

const AWS = require('aws-sdk');
const marked = require('marked');
const moment = require('moment');
const Mustache = require('mustache');
const fs = require('fs');
const zlib = require('zlib');

const dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {


	Promise.resolve(function() {

        let yearMonth = 0;
        let url = '';
        
        if(event.pathParameters && event.pathParameters.year && event.pathParameters.month) {
		    yearMonth = parseInt(event.pathParameters.year) * 100 + parseInt(event.pathParameters.month);
		    url = '/' + event.pathParameters.year + '/' + event.pathParameters.month + '/' + event.pathParameters.post
        } else {
            url = event.path;
        }
		
		var params = {
			TableName: 'Posts',
			Key: {
				"yearMonth": {N: yearMonth.toString()},
				"url": {S: url}
			}
		};
		return params;
	}())
		.then(function(params) {
			return dynamodb.getItem(params).promise();
		})
		.then(function(data) {

			return data.Item;
		})
		.then(function(postContent) {
		    
			const post = {
				postTitle: postContent.postTitle.S,
				postContent: marked(postContent.postContent.S),
				publicationDate: moment(postContent.publicationDate.N.toString(), "YYYYMMDD").format("Do MMMM YYYY"),
				disableComments: postContent.disableComments && postContent.disableComments.BOOL
			};

			fs.readFile('./templates/postDetail.tmpl', function(err, content) {
				if(err) context.fail(err);
				var output = Mustache.render(content.toString(), post);
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
