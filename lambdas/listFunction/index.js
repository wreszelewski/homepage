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

    if(event.year) {
        params.IndexName = 'year-index';
        params.KeyConditionExpression = "#yr = :yyyy";
        params.ExpressionAttributeNames = {
        "#yr": "year"
    };
		params.ExpressionAttributeValues = {
					":yyyy": {N: event.year.toString()}
				};
		listName = 'Dev blog - ' + event.year.toString();
    } else {
        params.IndexName = 'pageNumber-index';
        params.KeyConditionExpression = "pageNumber = :pageNumber",
		params.ExpressionAttributeValues = {
					":pageNumber": {N: "1"}
				};

    }

	dynamodb.getItem({
		TableName : 'Metadata',
		Key: {
			"Key": { S : "lastPageNumber"}
		}
	}).promise()
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
		            }
		            postList.push(postEntry);
		        })
		        return postList;
		    })

			.then(function(data) {
				fs.readFile('./templates/list.tmpl', function(err, content) {
					if(err) context.fail(err);
					var output = Mustache.render(content.toString(), {posts: data, listName: listName});
					zlib.gzip(output, function(error, gzipped) {
					    if(error) context.fail(error);
					    context.succeed(gzipped.toString('base64'));
					})
				});
			})
			.catch(function(err) {
		        console.log(error);
		        context.fail(error);
		    });
		});
};
