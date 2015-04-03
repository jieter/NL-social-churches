/*
 * List of church presence on social networks in NL
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */
(function () {
	'use strict';

	// navigation
	var tabs = $('a[data-toggle="tab"]').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
		window.location.hash = $(this).attr('href');
	});

	var link = function (href, body) {
		body = body || href;
		if (href) {
			return '<a href="' + href + '">' + body + '</a>';
		} else {
			return '';
		}
	};

	var websiteLink = function (url) {
		return link(url, '<i class="fa fa-home fa-2x"></i>');
	};
	var facebookLink = function (url) {
		return link(url, '<i class="fa fa-facebook-square fa-2x"></i>');
	};
	var twitterLink = function (name) {
		return link('https://twitter.com/' + name.substr(1), '<i class="fa fa-twitter fa-2x"></i>');
	};

	function renderStatistics(list) {
		var stats = $('#stats-table');

		[
			['Kerken in lijst', list.length],

			['Kerken met facebook', list.reduce(function (a, b) {
				return (b['facebook_url'] !== '') ? a + 1 : a;
			}, 0)],

			['Aantal likes', list.reduce(function (a, b) {
				return (b['facebook'] && b['facebook']['likes'] > 0) ?
					a + b['facebook']['likes'] : a;
			}, 0)],
			['Kerken met twitter', list.reduce(function (a, b) {
				return (b['twitter_name']) ? a + 1 : a;
			}, 0)],

			['Aantal tweets', list.reduce(function (a, b) {
				if (b['twitter'] && b['twitter']['statuses_count']) {
					return a + b['twitter']['statuses_count'] || 0;
				} else {
					return a;
				}
			}, 0)],
			['Aantal volgers', list.reduce(function (a, b) {
				if (b['twitter'] && b['twitter']['followers_count']) {
					return a + b['twitter']['followers_count'] || 0;
				} else {
					return a;
				}
			}, 0)]
		].forEach(function (stat) {
			stats.append('<tr><td>' + stat[0] + '</td><td>' + stat[1] + '</td></tr>');
		});
	}

	function renderTable(list) {
		var table = $('table#churches');
		var tr, facebook;
		list.forEach(function (item) {
			tr = $('<tr></tr>');

			var td = function (value, cssClass) {
				if (value === undefined) {
					value = '';
				}
				var ret = $('<td>' + value + '</td>');
				if (cssClass) {
					ret.addClass(cssClass);
				}
				return ret.appendTo(tr);
			};

			td(item['name']);

			if (item['website']) {
				td(websiteLink(item['website']), 'website')
					.find('a').attr('title', 'Ga naar website van deze kerk');
			} else {
				td();
			}

			if (item['facebook_url'] && item['facebook_url'] !== '') {
				facebook = item['facebook'];

				td(facebookLink(item['facebook_url']), 'facebook');

				if (facebook['likes']) {
					td(facebook['likes'], 'facebook_likes');
					td(facebook['talking_about_count'], 'facebook_talking_about');

					if (facebook['talking_about_count'] && facebook['likes'] > 0) {
						var activiteit = facebook['talking_about_count'] / facebook['likes'];

						td(activiteit, 'facebook_activiteit');
					} else {
						td('');
					}
					td(facebook['checkins'], 'facebook_checkins');
				} else {
					td('besloten', 'facebook-closed')
						.attr('title', 'Deze groep is besloten waardoor geen statistieken opgevraagd kunnen worden');

					td('-', 'facebook-closed');
					td('-', 'facebook-closed');
					td('-', 'facebook-closed');
				}
			} else {
				td('-', 'no-facebook');
				td('-', 'no-facebook');
				td('-', 'no-facebook');
				td('-', 'no-facebook');
				td('-', 'no-facebook');
			}

			if (item['twitter_name'] && item['twitter_name'] !== '') {
				var twitter = item['twitter'];

				td(twitterLink(item['twitter_name']), 'twitter');

				td(twitter['statuses_count'], 'twitter_tweets');
				td(twitter['followers_count'], 'twitter_followers');
			} else {
				td('-', 'no-twitter');
				td('-', 'no-twitter');
				td('-', 'no-twitter');
			}
			table.append(tr);
		});

		$.extend($.fn.dataTableExt.oSort, {
			'percent-pre': function (a) {
				var x = (a === '-') ? 0 : a.replace(/%/, '');
					return parseFloat(x);
			},
			'percent-asc': function (a, b) {
				return ((a < b) ? -1 : ((a > b) ? 1 : 0));
			},
			'percent-desc': function (a, b) {
				return ((a < b) ? 1 : ((a > b) ? -1 : 0));
			}
		});

		$('#churches').dataTable({
			'sPaginationType': 'bs_normal',
			//'bInfo': false,
			'bLengthChange': false,

			'aoColumnDefs': [
				// no sorting
				{'asSorting': [], 'aTargets': [1, 2, 7]},

				{'sType': 'numeric', 'aTargets': [3]},
				{
					'sType': 'percent',
					'aTargets': [5],
					'mRender': function (data) {
						if (data === '' || data === '-') {
							return '-';
						} else {
							data = '' + (Math.round(data * 1000) / 10);
							if (data.indexOf('.') === -1) {
								data += '.0';
							}
							return data + '%';
						}
					}
				}
			]
		});

		$('#churches_filter').detach()
			.appendTo('ul.nav-tabs')
			.find('input')
				.addClass('form-control')
				.attr('placeholder', 'zoeken...');
		$('#churches_wrapper .row').eq(0).remove();
	}

	function renderMap(list) {
		var map = L.map('mapContainer').setView([52.332, 5.389], 8);
		L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png', {
			attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
			subdomains: '0123',
			minZoom: 2,
			maxZoom: 18
		}).addTo(map);

		var layer = L.featureGroup();

		tabs.on('shown.bs.tab', function () {
			map.invalidateSize();
			map.fitBounds(layer.getBounds());
		});
		list.forEach(function (item) {
			if (!item['facebook_url'] || item['facebook_url'] === '') {
				return;
			}
			var facebook = item['facebook'];
			if (!facebook['location'] || !facebook['location']['latitude']) {
				return;
			}

			var location = facebook['location'];
			var popup =
				'<h5>' + item['name'] + '</h5>' +
				location['street'] + '<br />' +
				location['zip'] + ' ' + location['country'];


			popup += '<br />' + websiteLink(item['website']) +
				' ' + facebookLink(item['facebook_url']);

			if (item['twitter_name'] && item['twitter_name'] !== '') {
				popup += ' ' + twitterLink(item['twitter_name']);
			}

			L.marker([
				location['latitude'],
				location['longitude']
			]).bindPopup(popup).addTo(layer);
		});

		layer.addTo(map);
	}

	function renderAddForm(list) {

		var form = $('#add-church');
		form.on('submit', function (event) {
			event.preventDefault();

			var data = {};
			form.find('input').each(function (item) {
				item = $(this);
				data[item.attr('id')] = $.trim(item.val());
			}).removeClass('has-error');

			var name = form.find('input#name').parent();
			if (data.name.length < 3) {
				name.addClass('has-error');
				alert('Naam mag niet leeg zijn');
				return;
			}

			if (data['facebook_url'] === '' && data['twitter_name'] === '') {
				form.find('input#twitter_name').addClass('has-error');
				form.find('input#facebook_url').addClass('has-error');

				alert('Voer minstens één social medium in');

				return;
			}

			if (data['twitter_name'] !== '' && data['twitter_name'].substr(0, 1) !== '@') {
				alert('Geef een twitternaam in die begint met een @');
				form.find('input#twitter_name').addClass('has-error');

				return;
			}

			var unique = true;
			list.forEach(function (item) {
				for (var key in data) {
					if (item[key] === '') {
						return;
					}
					if (item[key] === data[key]) {
						unique = false;
					}
				}
			});
			if (!unique) {
				alert('Deze kerk lijkt al in de lijst te staan...');
				return;
			}

			$.ajax({
				url: 'http://jieter.nl/NL-social-churches/add-church.php',
				type: 'POST',
				data: {
					json: JSON.stringify(data)
				},
				dataType: 'json',
				success: function () {
					form.find('input').val('');
					alert('bedankt!');
				}
			});
		});
	}

	var renderStats = function () {
		// http://bl.ocks.org/mbostock/3884955
		var margin = {top: 20, right: 180, bottom: 30, left: 50},
			width = window.innerWidth - 100 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

		var parseDate = d3.time.format('%Y-%m-%d').parse;

		var x = d3.time.scale().range([0, width]);

		var y1 = d3.scale.linear().range([height, 0]);
		var y2 = d3.scale.linear().range([height, 0]);

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis().scale(x).orient('bottom');

		var y1Axis = d3.svg.axis().scale(y1).orient('left')
		               .tickFormat(d3.format('s'));

		var line = d3.svg.line()
			.interpolate('basis')
			.x(function(d) { return x(d.date); })
			.y(function(d) { return d.yaxis(d.value); });

		var svg = d3.select('#stats').append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		var flatten = function (obj) {
			var ret = [];
			for (var date in obj) {
				var data = obj[date];
				ret.push({
					date: parseDate(date),

					tweets: data.tweets,
					likes: data.likes,
					checkins: data.checkins,
					totaal: data.total
				});
			}

			ret.sort(function (a, b) {
				return a.date - b.date;
			});

			return ret;
		};

		var axisMap = {
			'tweets': y1,
			'likes': y1,
			'checkins': y1,
			'totaal': y2
		};

		d3.json('data/stats.json', function(error, data) {
			data = flatten(data);
			color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'date'; }));

			var lines = color.domain().map(function(name) {
				return {
					name: name,
					values: data.map(function(d) {
						return {
							yaxis: axisMap[name],
							date: d.date, value: +d[name]
						};
					})
				};
			});

			x.domain(d3.extent(data, function(d) { return d.date; }));
			y1.domain([
				0,
				d3.max(lines, function(c) {
					return d3.max(c.values, function(v) {
						return (v.yaxis === y1) ? v.value : 0;
					});
				})
			]);
			y2.domain([
				0,
				d3.max(lines, function(c) {
					return d3.max(c.values, function(v) {
						return (v.yaxis === y2) ? v.value : 0;
					});
				}) * 1.1
			]);

			svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(xAxis);

			svg.append('g')
				.attr('class', 'y axis')
				.call(y1Axis)
			.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('y', 6)
				.attr('dy', '.71em')
				.style('text-anchor', 'end');

			var graph = svg.selectAll('.graph')
				.data(lines)
					.enter().append('g')
					.attr('class', 'graph');

			graph.append('path')
				.attr('class', 'line')
				.attr('d', function(d) { return line(d.values); })
				.style('stroke', function(d) { return color(d.name); });

			graph.append('text')
				.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
				.attr('transform', function(d) {
					return 'translate(' + x(d.value.date) + ',' + d.value.yaxis(d.value.value) + ')';
				})
				.attr('x', 3)
				.attr('dy', '.35em')
				.text(function(d) { return d.name; });
		});

	};

	$.getJSON('data/nl-churches-with-metrics.json', function onReply(list) {

		renderTable(list);

		if ($('#map').length === 1) {
			renderMap(list);
		}
		if ($('#stats-table').length === 1) {
			renderStatistics(list);
		}
		if ($('#add-church').length === 1) {
			renderAddForm(list);
		}

		if ($('#stats').length === 1 && d3) {
			renderStats();
		}

		if (window.location.hash !== '') {
			$('a[href="' + window.location.hash + '"]').click();
		}
	});

})();
