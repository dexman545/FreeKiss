/**
 * Bookmarks class (do not confuse with Bookmarks pages script). Allow to get user's bookmarks using the sync function
 * During the sync, functions can be registered to be called at the end of the synchronization
 */
var Bookmarks = {
	mangas: {},
	syncCallbacks: [],
	syncing: false,
	// Flag. If set to true, store additionnal informations on the bookmarks
	extended: false,
	/**
	 * Get the bookmarks from a jquery element passed in parameter
	 * @param {jQuery Node} bookmarks - Node containing the bookmarks in a table format
	 */
	setBookmarks: function(bookmarks) {
		this.mangas = {};
		bookmarks.each((i, node) => {
			this.updateBookmark(node);
		});
	},
	/**
	 * Update the information of a specific bookmark
	 * @param {jQuery Node} node - A bookmark node found on the bookmarklist page
	 * @return {integer} - Manga id of the updated bookmark
	 */
	updateBookmark: function(node) {
		let mid = $(node).find("td:eq(3) a").attr("mid");
		let link = $(node).find("td:eq(0) a.aManga");
		let m = {
			// href will be used to do fancy stuffs on the front page, like a blacklist (as the mid/bid are not on the front page)
			href: $(link).attr("href").substring(1),
			bid: $(node).find("td:eq(2) a").attr("bdid"),
			read: ($(node).find("td:eq(2) .aRead").css('display') != 'none')
		};
		if (this.extended) {
			m.name = $(link).text().trim();
			m.completed = $(node).find("td:eq(1) a").length == 0;
		}
		this.mangas[mid] = m;
		return mid;
	},
	/**
	 * Synchronize the bookmarks. The bookmarks are fetched from kissmanga BookmarkList page via an ajax request.
	 * @param {function} callback - The function to call when the bookmarks are loaded. Multiple call to sync queue the callbacks
	 * @param {boolean} syncOnce - If set to true, do not sync the bookmarks if they have already been sync one time. False by default
	 */
	sync: function(callback = null, syncOnce = false) {
		if (syncOnce && !this.isEmpty()) {
			callback();
			return;
		}
		if (callback != null) {
			this.syncCallbacks.push(callback);
		}
		if (!this.syncing) {
			this.syncing = true;
			var obj = this;
			$.ajax({
				type: "GET",
				url: "http://kissmanga.com/BookmarkList",
				success: function (html) {
					html = html.replace(/<img[^>]*>/g, "");
					obj.setBookmarks($(html).find(".listing tr:not(:first-child)"));
					obj.executeCallbacks();
					obj.syncing = false;
				}
			});
		}
	},
	/**
	 * Queue a callback in the syncCallbacks list.
	 * @param {function} callback - Callback to queue
	 */
	queueCallback: function(callback) {
		if (this.syncing) {
			this.syncCallbacks.push(callback);
		} else {
			callback();
		}
	},
	/**
	 * Execute all the stored synchronization dependant callbacks. The syncCallbacks queue is then cleared.
	 */
	executeCallbacks: function() {
		for (var i = 0; i < this.syncCallbacks.length; ++i) {
			this.syncCallbacks[i]();
		}
		this.syncCallbacks = [];
	},
	/**
	 * Get a bookmark using its url. (To use when no mID is available (looking at you, frontpage è.é))
	 * @param {string} url - Url of the bookmark page. Note that only the end of the url is stored (format: "Manga/*")
	 * @return {JSON} Informations about the bookmark or null if the url does not match a stored bookmark
	 */
	getByUrl: function(url) {
		for (var key in this.mangas) {
			if (this.mangas.hasOwnProperty(key) && this.mangas[key].href == url) {
				var ret = this.mangas[key];
				ret.mid = key;
				return ret;
			}
		}
		return null;
	},
	/**
	 * Check if there is any bookmarks loaded
	 * @return {boolean} True if there are bookmarks in the mangas variable, false otherwise
	 */
	isEmpty: function() {
		return (Object.keys(this.mangas).length == 0);
	},
	/**
	 * Return all the bookmarks informations
	 * @return {JSON} Bookmarks informations
	 */
	fetchAll: function() {
		return this.mangas;
	},
	/**
	 * Return the number of bookmarks
	 * @return {integer} Number of bookmarks
	 */
	count: function() {
		return Object.keys(this.mangas).length;
	}
};