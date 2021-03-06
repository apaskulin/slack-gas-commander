import { expect } from 'chai';
import SlackService from '../src/SlackService';
import SpreadsheetService from '../src/SpreadsheetService.js';

const columns = ['col1', 'col2', 'col3'],
	mockRows = [
		['row1col1', 'row1col2', 'row1col3'],
		['row2col1', 'row2col2', 'row2col3'],
		['row3col1', 'row3col2', 'row3col3'],
		['', '', '']
			['row4col1', 'row4col2', 'row4col3'],
		['row5col1', 'row5col2', 'row5col3'],
		['row6col1', 'row6col2', 'row6col3'],
		['row7col1', 'row6col2', 'row7col3'], // Duplicate col2 on purpose
		['', '', ''],
		['', '', '']
	];

describe('SlackService test', () => {
	describe('translateKeyValues', () => {
		const cases = [
			{
				msg: 'Simple replacement',
				input: '%one% is %two%',
				values: {
					one: 'Foo',
					two: 'Bar'
				},
				expected: 'Foo is Bar'
			},
			{
				msg: 'Replacement with values not in string',
				input: '%one% is %two%',
				values: {
					one: 'Foo',
					two: 'Bar',
					three: 'Baz',
					four: 'Quuz'
				},
				expected: 'Foo is Bar'
			},
			{
				msg: 'Replacement missing values',
				input: '%one% is %two%',
				values: {
					one: 'Foo'
				},
				expected: 'Foo is '
			},
			{
				msg: 'Replacement has value appear twice',
				input: '%one% is %two% but also %one% is %three%',
				values: {
					one: 'Foo',
					two: 'Bar',
					three: 'Baz'
				},
				expected: 'Foo is Bar but also Foo is Baz'
			}
		];

		const slack = new SlackService();
		cases.forEach(c => {
			it(c.msg, () => {
				expect(slack.translateKeyValues(c.input, c.values)).to.equal(c.expected);
			});
		});
	});

	describe('getResultOutput', () => {
		const mockSheet = new SpreadsheetService('', columns, 0, mockRows),
			mockFormat = {
				title: 'These are results for "%term%"',
				no_result: 'I couldn\'t find any results for %term%',
				result: 'Result for %term% is %col3%'
			},
			cases = [
				{
					msg: 'Single result',
					input: {
						lookup: 'foo',
						results: [
							{
								col1: 'foo',
								col2: 'bar',
								col3: 'baz'
							}
						]
					},
					expected: {
						attachments: [
							{
								mrkdwn_in: ['text'],
								color: '#36a64f',
								pretext: '',
								title: 'These are results for "foo"',
								text: ''
							},
							{
								mrkdwn_in: ['text'],
								text: 'Result for foo is baz'
							}
						]
					}
				},
				{
					msg: 'Multiple results',
					input: {
						lookup: 'foo',
						results: [
							{
								col1: 'foo1',
								col2: 'bar1',
								col3: 'baz1'
							},
							{
								col1: 'foo2',
								col2: 'bar2',
								col3: 'baz2'
							},
							{
								col1: 'foo3',
								col2: 'bar3',
								col3: 'baz3'
							}
						]
					},
					expected: {
						attachments: [
							{
								mrkdwn_in: ['text'],
								color: '#36a64f',
								pretext: '',
								title: 'These are results for "foo"',
								text: ''
							},
							{
								mrkdwn_in: ['text'],
								text: 'Result for foo is baz1'
							},
							{
								mrkdwn_in: ['text'],
								text: 'Result for foo is baz2'
							},
							{
								mrkdwn_in: ['text'],
								text: 'Result for foo is baz3'
							}
						]
					}
				},
				{
					msg: 'No results',
					input: {
						lookup: 'foo',
						results: []
					},
					expected: {
						attachments: [
							{
								mrkdwn_in: ['text'],
								color: '#36a64f', // TODO: Configurable
								pretext: '',
								title: 'I couldn\'t find any results for foo',
								text: ''
							}
						]
					}
				}
			];

		cases.forEach(c => {
			const slack = new SlackService(mockSheet.getColumns(), mockFormat);
			it(c.msg, () => {
				expect(slack.getResultOutput(c.input.lookup, c.input.results))
					.to.deep.equal(c.expected);
			});
		});

	});
});
