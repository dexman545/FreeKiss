// FreeKiss class. Manage the relation between FreeKiss and the localstorage (options, bookmarks status, etc.)
// Every script should put its main function in init to check if FreeKiss is disabled
var FreeKiss = {
	// Option class. Allow to manipulate FreeKiss options
	Options: {
		// Default options
		options: {
			frontpageManager: true,
			enhancedDisplay: true,
			bookmarksSorting: true,
			maxPageWidth: 800,
			maxDoublePageWidth: 1800,
			minPageWidth: 600,
			minDoublePageWidth: 1000,
			maxDisable: false,
			minDisable: false,
			disable: false
		},
		// Use init to load the options.
		init: function(fk) {
			var obj = this;
			chrome.storage.local.get("fk-options", function(opt) {
					if (opt['fk-options'] != null && Object.keys(opt['fk-options']).length > 0) {
						obj.options = opt['fk-options'];
					}
					fk.optionsLoaded = true;
					fk.loaded();
				}
			);
		},
		// Check if the option is set
		isSet: function(property) {
			return (this.options != null && this.options.hasOwnProperty(property));
		},
		// Return the option value or null if the option does not exist
		get: function(property) {
			return (this.isSet(property) ? this.options[property] : null);
		},
		// Set the property in the options with the appropriate value
		set: function(property, value) {
			this.options[property] = value;
		},
		// Save the options in localstorage
		save: function() {
			chrome.storage.local.set({"fk-options": this.options});
		},
		// Clear the options in localstorage
		clear: function() {
			chrome.storage.local.remove("fk-options");
		}
	},
	optionsLoaded: false,
	loadCallbacks: [],
	blockCallbacks: [],
	// Used to initialize the data in localstorage. Any method can be used in the callback (as the everything will be loaded)
	init: function(callback, block = true) {
		if (block) {
			this.blockCallbacks.push(callback);
		} else {
			this.loadCallbacks.push(callback);			
		}
		this.Options.init(this);
	},
	loaded: function() {
		// Once all the data is loaded, we execute the callback if FreeKiss is enabled or needEnable is false
		if (this.optionsLoaded) {
			for (var i = 0; i < this.loadCallbacks.length; i++) {
				this.loadCallbacks[i]();
			}
			this.loadCallbacks = [];
			if (!this.needEnable || this.Options.get("disable") === false) {
				for (var i = 0; i < this.blockCallbacks.length; i++) {
					this.blockCallbacks[i]();
				}				
			}
			this.blockCallbacks = [];
		}
	}
};
