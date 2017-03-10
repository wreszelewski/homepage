const AWS = require('aws-sdk');
const marked = require('marked');
const moment = require('moment');
const Mustache = require('mustache');
const fs = require('fs');
const zlib = require('zlib');

const dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {

	var params = {
		TableName: 'Posts'
	};
	var listName = 'Dev blog';
	Promise.resolve(function(){

		if(event.pathParameters && event.pathParameters.month) {
			params.KeyConditionExpression = "#yrm = :yyyymm";
			const yearMonth = parseInt(event.pathParameters.year) * 100 + parseInt(event.pathParameters.month);
			params.ExpressionAttributeNames = {
				"#yrm": "yearMonth"
			};

			params.ExpressionAttributeValues = {
				":yyyymm": {N: (yearMonth).toString()}
			};

			listName = "Dev blog - " + moment(yearMonth, 'YYYYMM').format("MMMM YYYY");
		} else if(event.pathParameters && event.pathParameters.year) {
			params.IndexName = 'year-index';
			params.KeyConditionExpression = "#yr = :yyyy";
			params.ExpressionAttributeNames = {
				"#yr": "year"
			};
			params.ExpressionAttributeValues = {
				":yyyy": {N: event.pathParameters.year}
			};
			listName = 'Dev blog - ' + event.pathParameters.year;
		} else {
			params.IndexName = 'pageNumber-index';
			params.KeyConditionExpression = "pageNumber = :pageNumber",
			params.ExpressionAttributeValues = {
				":pageNumber": {N: "1"}
			};

		}
		return params;
	}())
		.then(function () {
			return dynamodb.getItem({
				TableName : 'Metadata',
				Key: {
					"Key": { S : "lastPageNumber"}
				}
			}).promise();
		})
		.then(function(data){
			return data.Item.Value;
		})
		.then(function(lastPageNumber) {
			dynamodb.query(params).promise()
				.then(function(data) {
					var postList = [];
					data.Items.forEach(function(dataItem) {
						var postEntry = {
							postTitle: dataItem.postTitle.S,
							publicationDate: moment(dataItem.publicationDate.N.toString(), "YYYYMMDD").format("Do MMMM YYYY"),
							postContent: marked(dataItem.postContent.S.split('\n')[0]),
							url: dataItem.url.S
						};
						postList.push(postEntry);
					});
					return postList;
				})
				.then(function(data) {
					fs.readFile('./templates/list.tmpl', function(err, content) {
						if(err) context.fail(err);
						var output = Mustache.render(content.toString(), {posts: data, listName: listName});
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
					console.log(err);
					context.fail(err);
				});
		});
};
