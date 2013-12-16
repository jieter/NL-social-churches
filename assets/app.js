/*
 * List of church presence on social networks in NL
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */
(function () {
	'use strict';

	// Tabbed navigation
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
				location['zip'] + ' ' + location['city'];


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
				success: function (event) {
					form.find('input').val('');
					alert('bedankt!');
				}
			});

			return false;
		});
	}

	var tableColumns = {
		name: {title: 'Naam', 'label': 'Naam'},
		website: {
			title: 'Website',
			transform: websiteLink,
			noSort: true
		},

		facebook_url: {
			title: 'Facebook',
			transform: facebookLink,
			noSort: true
		},
		facebook_likes: {
			title: 'Facebook likes',
			icon: 'fa-thumbs-o-up',
			get: function (item) {
				if (item.facebook_name !== '') {
					if (item.facebook && item.facebook.likes) {
						return item.facebook.likes;
					} else {
						return 'besloten';
					}
				}
			}
		},
		facebook_talking_about: {
			title: 'Facebook interacites (talking about this',
			icon: 'fa-comments-o',
			get: function (item) {
				if (item.facebook && item.facebook.talking_about_count) {
					return item.facebook.talking_about_count;
				}
			}
		},
		facebook_activiteit: {
			title: 'Activiteit (interacties / likes)',
			icon: 'fa-signal',
			get: function (item) {
				if (item.facebook) {
					var facebook = item.facebook;
					if (facebook.talking_about_count > 0 && facebook.likes > 0){
						var data = facebook.talking_about_count / facebook.likes;
						data = '' + (Math.round(data * 1000) / 10);
						if (data.indexOf('.') === -1) {
							data += '.0';
						}
						return data + '%';
					}
				}
			}
		},
		facebook_checkins: {
			title: 'Facebook checkins',
			icon: 'fa-check',
			get: function (item) {
				if (item.facebook && item.facebook.checkins) {
					return item.facebook.checkins;
				}
			}
		},

		twitter_name: {
			title: 'Twitter',
			transform: twitterLink,
			noSort: true
		},
		tweets: {
			title: 'Tweets',
			icon: 'fa-twitter',
			get: function (item) {
				if (item.twitter && item.twitter.statuses_count) {
					return item.twitter.statuses_count;
				}
			}
		},
		followers: {
			title: 'Twittervolgers',
			icon: 'fa-users',
			get: function (item) {
				if (item.twitter && item.twitter.followers_count) {
					return item.twitter.followers_count;
				}
			}
		}
	};

	var headerTr = $('<tr></tr>').appendTo('#churches thead');
	var th, col;
	var keys = [];
	for (var key in tableColumns) {
		col = tableColumns[key];

		th = $('<th></th>')
			.addClass(key)
			.attr('data-sort', key);

		if (!col.noSort) {
			th.addClass('sort')
		}
		if (col.title) {
			th.attr('title', col.title);
		}
		if (col.icon) {
			th.html('<i class="fa ' + col.icon + '"></i>');
		} else if (col.label) {
			th.html(col.label);
		}
		th.appendTo(headerTr);
		keys.push(key);
	}

	function renderTable(columns, list) {
		var tbody = $('table#churches tbody');
		var key, col, tr, td, html;
		list.forEach(function (item) {
			tr = $('<tr></tr>');

			for (key in columns) {
				col = columns[key];

				td = $('<td></td>').addClass(key);

				html = col.get ? col.get(item) || '' : item[key];
				if (html && html !== '' && col.transform) {
					html = col.transform(html);
				}
				td.html(html);

				td.addClass((html === 'besloten') ? 'no-data' : '');
				tr.append(td);
			}
			tbody.append(tr);
		});

		$('#count').html('<p>' + list.length + ' kerken</p>');

		var list = new List('social-churches-page', {
			valueNames: keys,
			page: 10,
			plugins: [
				ListPagination({
					paginationClass: 'pagination',
					outerWindow: 1
				})
			]
		});
	}

	$.getJSON('data/nl-churches-with-metrics.json', function onReply(list) {

		renderTable(tableColumns, list);

		if ($('#map').length === 1) {
			renderMap(list);
		}
		if ($('#stats-table').length === 1) {
			renderStatistics(list);
		}
		if ($('#add-church').length === 1) {
			renderAddForm(list);
		}

		if (window.location.hash !== '') {
			$('a[href="' + window.location.hash + '"]').click();
		}
	});

})();
