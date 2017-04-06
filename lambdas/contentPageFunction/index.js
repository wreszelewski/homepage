'use strict';

const AWS = require('aws-sdk');
const marked = require('marked');
const moment = require('moment');
const Mustache = require('mustache');
const fs = require('fs');
const zlib = require('zlib');

const dynamodb = new AWS.DynamoDB();
const template = fs.readFileSync('./templates/postDetail.tmpl');

exports.handler = function(event, context) {
	return contentPageGet(event, context)
		.catch(dispatchErrorResponse);
};

function contentPageGet(event, context) {
	return getContentFromDb(event)
		.then(renderPage)
		.then(function(renderedPage) {
			return fetchResponse(event, context, renderedPage);
		});
}

function getContentFromDb(event) {
	return prepareDbRequestParams(event)
		.then(performDbRequest)
		.then(formatDbResponse);
}

function renderPage(pageContent) {
	return Mustache.render(template.toString(), pageContent);
}

function fetchResponse(event, context, renderedPage) {
	if(isGzipAllowed(event)) {
		zlib.gzip(renderedPage, function(error, gzipped) {
			if(error) throw error;
			dispatchSuccessResponse(context, {body: gzipped, contentEncoding: 'gzip'});
		});
	} else {
		dispatchSuccessResponse(context, {body: (new Buffer(renderedPage))});
	}
}

function prepareDbRequestParams(event) {
	if(isPostDetail(event)) {
		return preparePostDetailDbRequestParams(event);
	} else {
		return prepareOtherContentDbRequestParams(event);
	}
}

function isPostDetail(event) {
	return event.pathParameters && event.pathParameters.year && event.pathParameters.month;
}

function preparePostDetailDbRequestParams(event) {
	let yearMonth = parseInt(event.pathParameters.year) * 100 + parseInt(event.pathParameters.month);
	let url = '/' + event.pathParameters.year + '/' + event.pathParameters.month + '/' + event.pathParameters.post;
	return formatDbRequestParams(yearMonth, url);
}

function prepareOtherContentDbRequestParams(event) {
	let yearMonth = 0;
	let url = event.path;
	return formatDbRequestParams(yearMonth, url);
}

function formatDbRequestParams(yearMonth, url) {
	return Promise.resolve({
		TableName: 'Posts',
		Key: {
			"yearMonth": {N: yearMonth.toString()},
			"url": {S: url}
		}
	});
}

function performDbRequest(dbRequestParams) {
	return dynamodb.getItem(dbRequestParams).promise();
}

function formatDbResponse(dbResponse) {
	return {
		postTitle: dbResponse.Item.postContent.postTitle.S,
		postContent: marked(dbResponse.Item.postContent.postContent.S),
		postLead: marked(dbResponse.Item.postContent.postContent.S.split('\n')[0]),
		publicationDate: moment(dbResponse.Item.postContent.publicationDate.N.toString(), "YYYYMMDD").format("Do MMMM YYYY"),
		disableComments: dbResponse.Item.postContent.disableComments && dbResponse.Item.postContent.disableComments.BOOL
	};
}

function isGzipAllowed(event) {
	return event.headers && event.headers['Accept-Encoding'] && event.headers['Accept-Encoding'].indexOf('gzip') !== -1;
}

function dispatchErrorResponse(context, response) {
	context.fail(response);
}

function dispatchSuccessResponse(context, response) {
	var formattedResponse = {
		statusCode: 200,
		body: response.body.toString('base64'),
		isBase64Encoded: true,
		headers: {
			'Content-Type': 'text/html',
			'Vary': 'Accept-Encoding'
		}
	};
	if(response.contentEncoding) {
		formattedResponse.headers['Content-Encoding'] = response.contentEncoding;
	}
	context.succeed(formattedResponse);
}
