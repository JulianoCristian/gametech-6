// ==UserScript==
// @name         Gametech Community Style
// @namespace    http://github.com/aldoom/gametech
// @include      http://www.gametech.ru/*
// @author       SamuraiJack
// @description  SamuraiJack: Удобные новости, красивые комментарии, читабельный текст.
//               Полный список новостей на главной странице.
// @version     4.2.6.6
// ==/UserScript==

try{
	chrome.extension.sendRequest({}, function(response) {});
}catch(e){}

function addJQuery(callback) {
	var script = document.createElement("script");
	script.setAttribute("src", "/resources/js/jquery-1.7.min.js");
	script.addEventListener('load', function() {
		var script = document.createElement("script");
		script.textContent = "(" + callback.toString() + ")();";
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

function main() {
	/* store params/settings in coockies */
	/**
	 * Example:
	 * GET
	 * gtnamespace.cookies.get('myCookie');
	 *   returns value of myCookie if it is present, null if not 
	 * gtnamespace.cookies.get(['myCookie', 'myOtherCookie']);
	 *   returns array containing value of each requested cookie if it is present, null if not 
	 * gtnamespace.cookies.get();
	 *   returns array of all cookies from your site
	 * 
	 * 
	 * FILTER
	 * gtnamespace.cookies.filter( /^site/ );
	 *   returns list of cookies whose names start with "site" 
	 * 
	 * 
	 * SET
	 * gtnamespace.cookies.set('myCookie', 'myValue');
	 *   sets cookie by the name of 'myCookie' to value of 'myValue' with default options 
	 * gtnamespace.cookies.set('myCookie', 'myValue', {path: '/somedir'});
	 *   sets cookie by the name of 'myCookie' to value of 'myValue' with path of '/somedir' 
	 * 
	 * 
	 * DELETE
	 * gtnamespace.cookies.del('myCookie');
	 *   deletes a cookie, 'myCookie', with default options 
	 * gtnamespace.cookies.del('myCookie', {path: '/somedir'});
	 *   deletes a cookie by the name of 'myCookie' which had been set with a path of '/somedir' 
	 * gtnamespace.cookies.del(true);
	 *   deletes all cookies 
	 * 
	 * 
	 * TEST
	 * gtnamespace.cookies.test();
	 *   attempts to set a cookie and returns true or false upon success or failure 
	 * 
	 * 
	 * SET OPTIONS
	 * gtnamespace.cookies.setOptions({path: '/somedir'});
	 *   all cookies will be set or deleted with the path , '/somedir', unless it is explicitly provided in a passed options object 
	 * 
	 * 
	 * 
	 */
	var gtnamespace = window.gtnamespace || {};
	gtnamespace.cookies = ( function() {
		var resolveOptions, assembleOptionsString, parseCookies, constructor, defaultOptions = {
			expiresAt: null,
			path: '/',
			domain:  null,
			secure: false
		};
		
		/**
		* resolveOptions - receive an options object and ensure all options are present and valid, replacing with defaults where necessary
		*
		* @access private
		* @static
		* @parameter Object options - optional options to start with
		* @return Object complete and valid options object
		*/
		resolveOptions = function( options )
		{
			var returnValue, expireDate;

			if( typeof options !== 'object' || options === null )
			{
				returnValue = defaultOptions;
			}
			else
			{
				returnValue = {
					expiresAt: defaultOptions.expiresAt,
					path: defaultOptions.path,
					domain: defaultOptions.domain,
					secure: defaultOptions.secure
				};

				if( typeof options.expiresAt === 'object' && options.expiresAt instanceof Date )
				{
					returnValue.expiresAt = options.expiresAt;
				}
				else
				{
					expireDate = new Date();
					expireDate.setTime( expireDate.getTime() + ( 365 * 24 * 60 * 60 * 1000 ) );
					returnValue.expiresAt = expireDate;
				}

				if( typeof options.path === 'string' && options.path !== '' )
				{
					returnValue.path = options.path;
				}

				if( typeof options.domain === 'string' && options.domain !== '' )
				{
					returnValue.domain = options.domain;
				}

				if( options.secure === true )
				{
					returnValue.secure = options.secure;
				}
			}

			return returnValue;
		};
		
		/**
		* assembleOptionsString - analyze options and assemble appropriate string for setting a cookie with those options
		*
		* @access private
		* @static
		* @parameter options OBJECT - optional options to start with
		* @return STRING - complete and valid cookie setting options
		*/
		assembleOptionsString = function( options )
		{
			options = resolveOptions( options );

			return (
				( typeof options.expiresAt === 'object' && options.expiresAt instanceof Date ? '; expires=' + options.expiresAt.toGMTString() : '' ) +
				'; path=' + options.path +
				( typeof options.domain === 'string' ? '; domain=' + options.domain : '' ) +
				( options.secure === true ? '; secure' : '' )
			);
		};
		
		/**
		* parseCookies - retrieve document.cookie string and break it into a hash with values decoded and unserialized
		*
		* @access private
		* @static
		* @return OBJECT - hash of cookies from document.cookie
		*/
		parseCookies = function()
		{
			var cookies = {}, i, pair, name, value, separated = document.cookie.split( ';' ), unparsedValue;
			for( i = 0; i < separated.length; i = i + 1 )
			{
				pair = separated[i].split( '=' );
				name = pair[0].replace( /^\s*/, '' ).replace( /\s*$/, '' );

				try
				{
					value = decodeURIComponent( pair[1] );
				}
				catch( e1 )
				{
					value = pair[1];
				}

				if( typeof JSON === 'object' && JSON !== null && typeof JSON.parse === 'function' )
				{
					try
					{
						unparsedValue = value;
						value = JSON.parse( value );
					}
					catch( e2 )
					{
						value = unparsedValue;
					}
				}

				cookies[name] = value;
			}
			return cookies;
		};

		constructor = function(){};

		/**
		 * get - get one, several, or all cookies
		 *
		 * @access public
		 * @paramater Mixed cookieName - String:name of single cookie; Array:list of multiple cookie names; Void (no param):if you want all cookies
		 * @return Mixed - Value of cookie as set; Null:if only one cookie is requested and is not found; Object:hash of multiple or all cookies (if multiple or all requested);
		 */
		constructor.prototype.get = function( cookieName )
		{
			var returnValue, item, cookies = parseCookies();

			if( typeof cookieName === 'string' )
			{
				returnValue = ( typeof cookies[cookieName] !== 'undefined' ) ? cookies[cookieName] : null;
			}
			else if( typeof cookieName === 'object' && cookieName !== null )
			{
				returnValue = {};
				for( item in cookieName )
				{
					if( typeof cookies[cookieName[item]] !== 'undefined' )
					{
						returnValue[cookieName[item]] = cookies[cookieName[item]];
					}
					else
					{
						returnValue[cookieName[item]] = null;
					}
				}
			}
			else
			{
				returnValue = cookies;
			}

			return returnValue;
		};
		
		/**
		 * filter - get array of cookies whose names match the provided RegExp
		 *
		 * @access public
		 * @paramater Object RegExp - The regular expression to match against cookie names
		 * @return Mixed - Object:hash of cookies whose names match the RegExp
		 */
		constructor.prototype.filter = function( cookieNameRegExp )
		{
			var cookieName, returnValue = {}, cookies = parseCookies();

			if( typeof cookieNameRegExp === 'string' )
			{
				cookieNameRegExp = new RegExp( cookieNameRegExp );
			}

			for( cookieName in cookies )
			{
				if( cookieName.match( cookieNameRegExp ) )
				{
					returnValue[cookieName] = cookies[cookieName];
				}
			}

			return returnValue;
		};
		
		/**
		 * set - set or delete a cookie with desired options
		 *
		 * @access public
		 * @paramater String cookieName - name of cookie to set
		 * @paramater Mixed value - Any JS value. If not a string, will be JSON encoded; NULL to delete
		 * @paramater Object options - optional list of cookie options to specify
		 * @return void
		 */
		constructor.prototype.set = function( cookieName, value, options )
		{
			if( typeof options !== 'object' || options === null )
			{
				options = {};
			}

			if( typeof value === 'undefined' || value === null )
			{
				value = '';
				options.expiresAt = -8760;
			}

			else if( typeof value !== 'string' )
			{
				if( typeof JSON === 'object' && JSON !== null && typeof JSON.stringify === 'function' )
				{
					value = JSON.stringify( value );
				}
				else
				{
					throw new Error( 'cookies.set() received non-string value and could not serialize.' );
				}
			}


			var optionsString = assembleOptionsString( options );

			document.cookie = cookieName + '=' + encodeURIComponent( value ) + optionsString;
		};
		
		/**
		 * del - delete a cookie (domain and path options must match those with which the cookie was set; this is really an alias for set() with parameters simplified for this use)
		 *
		 * @access public
		 * @paramater MIxed cookieName - String name of cookie to delete, or Bool true to delete all
		 * @paramater Object options - optional list of cookie options to specify ( path, domain )
		 * @return void
		 */
		constructor.prototype.del = function( cookieName, options )
		{
			var allCookies = {}, name;

			if( typeof options !== 'object' || options === null )
			{
				options = {};
			}

			if( typeof cookieName === 'boolean' && cookieName === true )
			{
				allCookies = this.get();
			}
			else if( typeof cookieName === 'string' )
			{
				allCookies[cookieName] = true;
			}

			for( name in allCookies )
			{
				if( typeof name === 'string' && name !== '' )
				{
					this.set( name, null, options );
				}
			}
		};
		
		/**
		 * test - test whether the browser is accepting cookies
		 *
		 * @access public
		 * @return Boolean
		 */
		constructor.prototype.test = function()
		{
			var returnValue = false, testName = 'cT', testValue = 'data';

			this.set( testName, testValue );

			if( this.get( testName ) === testValue )
			{
				this.del( testName );
				returnValue = true;
			}

			return returnValue;
		};
		
		/**
		 * setOptions - set default options for calls to cookie methods
		 *
		 * @access public
		 * @param Object options - list of cookie options to specify
		 * @return void
		 */
		constructor.prototype.setOptions = function( options )
		{
			if( typeof options !== 'object' )
			{
				options = null;
			}

			defaultOptions = resolveOptions( options );
		};

		return new constructor();
	} )();
	
	gtnamespace.theme = ( function() {
		var composeSelect, getStoredThemes, getAllThemes, setStoredThemes, applySettings, checkNewFields, 
		
		constructor, defaultTheme = {
			name: 'Theme Complex',
			fontFamily: 'Helvetica',
			commentBodyGradient: "false",
			commentBodyColorStart: '#FFFFFF',
			commentBodyColorEnd: '#EAF2F9',
			newsTextSizeHeader: '17',
			newsTextSizeBody: '14',
			commentTextSize: '14',
			commentOfftopicTextSize: '14',
			commentSpoilerTextSize: '14',
			commentTurnOffTextShadow: 'true',
			commentRateColorType: 'color',
			//commentUpRateColor: '#B3F3B3',
			//commentDownRateColor: '#F3B3B3',
			turnOffLastComments: "false"
		},
		defaultGradientTheme = {
			name: 'Theme Complex Gradient',
			fontFamily: 'Verdana',
			commentBodyGradient: "true",
			commentBodyColorStart: '#FFFFFF',
			commentBodyColorEnd: '#BACDDD',
			newsTextSizeHeader: '17',
			newsTextSizeBody: '14',
			commentTextSize: '14',
			commentOfftopicTextSize: '12',
			commentSpoilerTextSize: '12',
			commentTurnOffTextShadow: 'true',
			commentRateColorType: 'color',
			//commentUpRateColor: '#B3F3B3',
			//commentDownRateColor: '#F3B3B3',
			turnOffLastComments: "false"
		},
		SJTheme = {
			name: 'Theme SamuraiJack',
			fontFamily: 'Arial',
			commentBodyGradient: "false",
			commentBodyColorStart: '#FFFFFF',
			commentBodyColorEnd: '#EAF2F9',
			newsTextSizeHeader: '17',
			newsTextSizeBody: '14',
			commentTextSize: '14',
			commentOfftopicTextSize: '14',
			commentSpoilerTextSize: '14',
			commentTurnOffTextShadow: 'true',
			commentRateColorType: 'color',
			//commentUpRateColor: '#B3F3B3',
			//commentDownRateColor: '#F3B3B3',
			turnOffLastComments: "false"
		},
		cookieCurrentTheme = 'gt-current-theme',
		cookieStoredThemes = 'gt-stored-themes',
		fonts = [{name:'Verdana'}, {name:'Arial'}, {name:'Tahoma'}, {name:'Helvetica'}];
		
		composeSelect = function(name, options, selected) {
			var selectBox = $('<select name="'+name+'" id="'+name+'" style="width:100%;"></select>');
			
			for (var i = 0, len = options.length; i < len; ++i) {
				var o = options[i];
				var selectedAttr = '';
				var optionValue, optionText;
				if (typeof o.value !== 'undefined') {
					optionValue = o.value;
				} else if (typeof o.name !== 'undefined') {
					optionValue = o.name;
				}
				
				if (typeof o.text !== 'undefined') {
					optionText = o.text;
				} else if (typeof o.name !== 'undefined') {
					optionText = o.name;
				}
				
				if (selected == optionValue) {
					selectedAttr = ' selected="selected"';
				}
				selectBox.append('<option value="'+optionValue+'"'+selectedAttr+'>'+optionText+'</option>');
			}
			
			return selectBox;
		};
		
		getStoredThemes = function() {
			var storedThemes = gtnamespace.cookies.get(cookieStoredThemes);
			return storedThemes;
		};
		
		getAllThemes = function() {
			var returnArray = [];
			var storedThemes = getStoredThemes();
			if (storedThemes == null) {
				storedThemes = [];
			}
			
			returnArray.push(defaultTheme);
			returnArray.push(SJTheme);
			returnArray.push(defaultGradientTheme);
			for (i = 0; i < storedThemes.length; i++) {
				returnArray.push(storedThemes[i]);
			}
			
			return returnArray;
		};
		
		setStoredThemes = function(storedThemes) {
			gtnamespace.cookies.set(cookieStoredThemes, storedThemes);
		};
		
		applySettings = function() {
			var settingsBlock = $('.user_theme_settings');
			
			var themeName = settingsBlock.find('#gt-theme-name').val();
			
			var themeToSave = {
				name: themeName,
				fontFamily: settingsBlock.find('#gt-font').val(),
				commentBodyGradient: settingsBlock.find('#gt-comments-gradient').val(),
				commentBodyColorStart: settingsBlock.find('#gt-comments-gradient-start').val(),
				commentBodyColorEnd: settingsBlock.find('#gt-comments-gradient-end').val(),
				newsTextSizeHeader: settingsBlock.find('#gt-news-text-size-header').val(),
				newsTextSizeBody: settingsBlock.find('#gt-news-text-size-body').val(),
				commentTextSize: settingsBlock.find('#gt-comments-text-size').val(),
				commentOfftopicTextSize: settingsBlock.find('#gt-comments-offtopic-text-size').val(),
				commentSpoilerTextSize: settingsBlock.find('#gt-comments-spoiler-text-size').val(),
				commentTurnOffTextShadow: settingsBlock.find('#gt-comments-turn-off-text-shadow').val(),
				commentRateColorType: settingsBlock.find('#gt-comments-rate-color-type').val(),
				//commentUpRateColor: settingsBlock.find('#gt-comments-up-rate-color').val(),
				//commentDownRateColor: settingsBlock.find('#gt-comments-down-rate-color').val(),
				turnOffLastComments: settingsBlock.find('#gt-turn-off-last-comments').val()
			};
			
			var isStored = false;
			if (
				(themeName == defaultTheme.name 
					&& (
						themeToSave.fontFamily != defaultTheme.fontFamily ||
						themeToSave.commentBodyGradient != defaultTheme.commentBodyGradient ||
						themeToSave.commentBodyColorStart != defaultTheme.commentBodyColorStart ||
						themeToSave.commentBodyColorEnd != defaultTheme.commentBodyColorEnd ||
						themeToSave.newsTextSizeHeader != defaultTheme.newsTextSizeHeader ||
						themeToSave.newsTextSizeBody != defaultTheme.newsTextSizeBody ||
						themeToSave.commentTextSize != defaultTheme.commentTextSize ||
						themeToSave.commentOfftopicTextSize != defaultTheme.commentOfftopicTextSize ||
						themeToSave.commentSpoilerTextSize != defaultTheme.commentSpoilerTextSize ||
						themeToSave.commentTurnOffTextShadow != defaultTheme.commentTurnOffTextShadow ||
						themeToSave.commentRateColorType != defaultTheme.commentRateColorType ||
						//themeToSave.commentUpRateColor != defaultTheme.commentUpRateColor ||
						//themeToSave.commentDownRateColor != defaultTheme.commentDownRateColor ||
						themeToSave.turnOffLastComments != defaultTheme.turnOffLastComments
						)
				) 
				|| 
				(themeName == SJTheme.name
					&& (
						themeToSave.fontFamily != SJTheme.fontFamily ||
						themeToSave.commentBodyGradient != SJTheme.commentBodyGradient ||
						themeToSave.commentBodyColorStart != SJTheme.commentBodyColorStart ||
						themeToSave.commentBodyColorEnd != SJTheme.commentBodyColorEnd ||
						themeToSave.newsTextSizeHeader != SJTheme.newsTextSizeHeader ||
						themeToSave.newsTextSizeBody != SJTheme.newsTextSizeBody ||
						themeToSave.commentTextSize != SJTheme.commentTextSize ||
						themeToSave.commentOfftopicTextSize != SJTheme.commentOfftopicTextSize ||
						themeToSave.commentSpoilerTextSize != SJTheme.commentSpoilerTextSize ||
						themeToSave.commentTurnOffTextShadow != SJTheme.commentTurnOffTextShadow ||
						themeToSave.commentRateColorType != SJTheme.commentRateColorType ||
						//themeToSave.commentUpRateColor != SJTheme.commentUpRateColor ||
						//themeToSave.commentDownRateColor != SJTheme.commentDownRateColor ||
						themeToSave.turnOffLastComments != SJTheme.turnOffLastComments
						)
				)
				|| 
				(themeName == defaultGradientTheme.name
					&& (
						themeToSave.fontFamily != defaultGradientTheme.fontFamily ||
						themeToSave.commentBodyGradient != defaultGradientTheme.commentBodyGradient ||
						themeToSave.commentBodyColorStart != defaultGradientTheme.commentBodyColorStart ||
						themeToSave.commentBodyColorEnd != defaultGradientTheme.commentBodyColorEnd ||
						themeToSave.newsTextSizeHeader != defaultGradientTheme.newsTextSizeHeader ||
						themeToSave.newsTextSizeBody != defaultGradientTheme.newsTextSizeBody ||
						themeToSave.commentTextSize != defaultGradientTheme.commentTextSize ||
						themeToSave.commentOfftopicTextSize != defaultGradientTheme.commentOfftopicTextSize ||
						themeToSave.commentSpoilerTextSize != defaultGradientTheme.commentSpoilerTextSize ||
						themeToSave.commentTurnOffTextShadow != defaultGradientTheme.commentTurnOffTextShadow ||
						themeToSave.commentRateColorType != defaultGradientTheme.commentRateColorType ||
						//themeToSave.commentUpRateColor != defaultGradientTheme.commentUpRateColor ||
						//themeToSave.commentDownRateColor != defaultGradientTheme.commentDownRateColor ||
						themeToSave.turnOffLastComments != defaultGradientTheme.turnOffLastComments
						)
				)
				) {
				themeToSave.name = themeToSave.name + ' copy';
			} else if (themeName == defaultTheme.name || themeName == SJTheme.name || themeName == defaultGradientTheme.name) {
				isStored = true;
			}
			
			
			var storedThemes = getStoredThemes();
			if (storedThemes == null) {
				storedThemes = [];
			}
			
			if (!isStored) {
				for (i = 0; i < storedThemes.length; i++) {
					if (storedThemes[i].name == themeToSave.name) {
						isStored = true;
						storedThemes[i] = themeToSave;
					}
				}
			}
			
			if (!isStored) {
				storedThemes.push(themeToSave);
			}
			
			setStoredThemes(storedThemes);
			
			
			gtnamespace.cookies.set(cookieCurrentTheme, themeToSave);
			
			window.location.reload(true);
		};
		
		checkNewFields = function(theme){
			if (theme != null) {
				if (typeof theme.newsTextSizeHeader === 'undefined') {
					theme.newsTextSizeHeader = defaultTheme.newsTextSizeHeader;
				}
				
				if (typeof theme.newsTextSizeBody === 'undefined') {
					theme.newsTextSizeBody = defaultTheme.newsTextSizeBody;
				}
				
				if (typeof theme.commentTextSize === 'undefined') {
					theme.commentTextSize = defaultTheme.commentTextSize;
				}
				
				if (typeof theme.commentOfftopicTextSize === 'undefined') {
					theme.commentOfftopicTextSize = defaultTheme.commentOfftopicTextSize;
				}
				
				if (typeof theme.commentSpoilerTextSize === 'undefined') {
					theme.commentSpoilerTextSize = defaultTheme.commentSpoilerTextSize;
				}
				
				if (typeof theme.commentRateColorType === 'undefined') {
					theme.commentRateColorType = defaultTheme.commentRateColorType;
				}
				
				if (typeof theme.commentTurnOffTextShadow === 'undefined') {
					theme.commentTurnOffTextShadow = defaultTheme.commentTurnOffTextShadow;
				}
				/*
				if (typeof theme.commentUpRateColor === 'undefined') {
					theme.commentUpRateColor = defaultTheme.commentUpRateColor;
				}
				
				if (typeof theme.commentDownRateColor === 'undefined') {
					theme.commentDownRateColor = defaultTheme.commentDownRateColor;
				}
				*/
				if (typeof theme.turnOffLastComments === 'undefined') {
					theme.turnOffLastComments = defaultTheme.turnOffLastComments;
				}
				
			} else {
				theme = defaultTheme;
			}
			return theme;
		};
		
		constructor = function(){};
		
		constructor.prototype.getCurrentTheme = function() {
			var currentTheme = gtnamespace.cookies.get(cookieCurrentTheme);
			if (currentTheme == null || currentTheme == '') {
				return defaultTheme;
			} else {
				currentTheme = checkNewFields(currentTheme);
				return currentTheme;
			}
			
		};
		
		constructor.prototype.init = function() {
/*
<div class="user_theme_block">
	<div class="user_theme_current">Theme Default</div>
	<div class="clear"></div>
	<div class="user_theme_settings">
		<select>
			<option value="0">Theme Default</option>
			<option value="1">My Theme</option>
		</select>
	</div>
	<div class="clear"></div>
</div>
*/
			var currentTheme = this.getCurrentTheme();
			var allThemes = getAllThemes();

			var startPositionForThemeBlock=$('div.user_logined_block')[0] || $('div.auth_actions')[0];
			
			var pluginInfoBlock = $('<div class="plugin_info_block dnone"></div>');
			pluginInfoBlock.insertAfter(startPositionForThemeBlock);
			
			var userThemeBlock = $('<div class="user_theme_block"></div>');
			userThemeBlock.insertAfter(startPositionForThemeBlock);

			var headerThemeBlock = $('<div class="user_theme_current"></div>');
			headerThemeBlock.html(currentTheme.name);
			
			userThemeBlock.append(headerThemeBlock);
			userThemeBlock.append('<div class="clear"></div>');

			var settingsBlock = $('<div class="user_theme_settings"></div>');
			settingsBlock.addClass('dnone');
			settingsBlock.append('<div style="font: 12px bold;">Тема</div>');
			settingsBlock.append(composeSelect('gt-theme',allThemes,currentTheme.name));
			userThemeBlock.append(settingsBlock);
			userThemeBlock.append('<div class="clear"></div>');
			
			settingsBlock.append('<div style="font: 12px bold;">Название</div>');
			settingsBlock.append('<input type="text" name="gt-theme-name" id="gt-theme-name" value="'+currentTheme.name+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Шрифт</div>');
			settingsBlock.append(composeSelect('gt-font',fonts,currentTheme.fontFamily));
			
			settingsBlock.append('<div style="font: 12px bold;">Градиент в комментариях</div>');
			settingsBlock.append(composeSelect('gt-comments-gradient',[{value:"true", text:'Да'},{value:"false", text:'Нет'}],currentTheme.commentBodyGradient));
			
			settingsBlock.append('<div style="font: 12px bold;">Градиент, цвета слева</div>');
			settingsBlock.append('<input type="text" name="gt-comments-gradient-start" id="gt-comments-gradient-start" value="'+currentTheme.commentBodyColorStart+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Градиент, цвета справа</div>');
			settingsBlock.append('<input type="text" name="gt-comments-gradient-end" id="gt-comments-gradient-end" value="'+currentTheme.commentBodyColorEnd+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Размер шрифта заголовка новости</div>');
			settingsBlock.append('<input type="text" name="gt-news-text-size-header" id="gt-news-text-size-header" value="'+(typeof currentTheme.newsTextSizeHeader == 'undefined' ? defaultTheme.newsTextSizeHeader : currentTheme.newsTextSizeHeader)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Размер шрифта текста новости</div>');
			settingsBlock.append('<input type="text" name="gt-news-text-size-body" id="gt-news-text-size-body" value="'+(typeof currentTheme.newsTextSizeBody == 'undefined' ? defaultTheme.newsTextSizeBody : currentTheme.newsTextSizeBody)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Размер шрифта текста комментария</div>');
			settingsBlock.append('<input type="text" name="gt-comments-text-size" id="gt-comments-text-size" value="'+(typeof currentTheme.commentTextSize == 'undefined' ? defaultTheme.commentTextSize : currentTheme.commentTextSize)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Размер шрифта оффтопика комментария</div>');
			settingsBlock.append('<input type="text" name="gt-comments-offtopic-text-size" id="gt-comments-offtopic-text-size" value="'+(typeof currentTheme.commentOfftopicTextSize == 'undefined' ? defaultTheme.commentOfftopicTextSize : currentTheme.commentOfftopicTextSize)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Размер шрифта спойлера комментария</div>');
			settingsBlock.append('<input type="text" name="gt-comments-spoiler-text-size" id="gt-comments-spoiler-text-size" value="'+(typeof currentTheme.commentSpoilerTextSize == 'undefined' ? defaultTheme.commentSpoilerTextSize : currentTheme.commentSpoilerTextSize)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Тень от текста на заголовке комментария</div>');
			settingsBlock.append(composeSelect('gt-comments-turn-off-text-shadow',[{value:"true", text:'выключена'},{value:"false", text:'включена'}],(typeof currentTheme.commentTurnOffTextShadow == 'undefined' ? defaultTheme.commentTurnOffTextShadow : currentTheme.commentTurnOffTextShadow)));
			
			settingsBlock.append('<div style="font: 12px bold;">Тип рейтингов комментариев</div>');
			settingsBlock.append(composeSelect('gt-comments-rate-color-type',[{value:"default", text:'по умочанию'},{value:"color", text:'цветной'},{value:"hidden", text:'не показывать'}],(typeof currentTheme.commentRateColorType == 'undefined' ? defaultTheme.commentRateColorType : currentTheme.commentRateColorType)));
			
			settingsBlock.append('<div style="font: 12px bold;">Последние комментарии</div>');
			settingsBlock.append(composeSelect('gt-turn-off-last-comments',[{value:"true", text:'выключены'},{value:"false", text:'включены'}],(typeof currentTheme.turnOffLastComments == 'undefined' ? defaultTheme.turnOffLastComments : currentTheme.turnOffLastComments)));
			
			/*
			settingsBlock.append('<div style="font: 12px bold;">Цвет высокого рейтинга</div>');
			settingsBlock.append('<input type="text" name="gt-comments-up-rate-color" id="gt-comments-up-rate-color" value="'+(typeof currentTheme.commentUpRateColor == 'undefined' ? defaultTheme.commentUpRateColor : currentTheme.commentUpRateColor)+'" style="width:100%;" />');
			
			settingsBlock.append('<div style="font: 12px bold;">Цвет низкого рейтинга</div>');
			settingsBlock.append('<input type="text" name="gt-comments-down-rate-color" id="gt-comments-down-rate-color" value="'+(typeof currentTheme.commentDownRateColor == 'undefined' ? defaultTheme.commentDownRateColor : currentTheme.commentDownRateColor)+'" style="width:100%;" />');
			*/
			settingsBlock.append('<input type="button" id="gt-settings-save" value="Применить" style="width:100%;" />');
			
			/* js events */
			$('.user_theme_block .user_theme_current').live('click', function(){
				$(this).parent('.user_theme_block').find('.user_theme_settings').toggleClass('dnone');
			});
			
			$('select[name="gt-theme"]').live('change', function(){
				var allThemes = getAllThemes();
				if (allThemes == null) {
					allThemes = [];
				}
				var currentThemeName = $(this).val();
				var currentTheme = null;
				for (i = 0; i < allThemes.length; i++) {
					if (allThemes[i].name == currentThemeName) {
						currentTheme = allThemes[i];
					}
				}
				
				if (currentTheme != null) {
					if (typeof currentTheme.name !== 'undefined') {
						$('.user_theme_settings #gt-theme-name').val(currentTheme.name);
					}
					
					if (typeof currentTheme.fontFamily !== 'undefined') {
						$('.user_theme_settings #gt-font').val(currentTheme.fontFamily);
					}
					
					if (typeof currentTheme.commentBodyGradient !== 'undefined') {
						$('.user_theme_settings #gt-comments-gradient').val(currentTheme.commentBodyGradient);
					}
					
					if (typeof currentTheme.commentBodyColorStart !== 'undefined') {
						$('.user_theme_settings #gt-comments-gradient-start').val(currentTheme.commentBodyColorStart);
					}
					
					if (typeof currentTheme.commentBodyColorEnd !== 'undefined') {
						$('.user_theme_settings #gt-comments-gradient-end').val(currentTheme.commentBodyColorEnd);
					}
					
					if (typeof currentTheme.newsTextSizeHeader !== 'undefined') {
						$('.user_theme_settings #gt-news-text-size-header').val(currentTheme.newsTextSizeHeader);
					}
					
					if (typeof currentTheme.newsTextSizeBody !== 'undefined') {
						$('.user_theme_settings #gt-news-text-size-body').val(currentTheme.newsTextSizeBody);
					}
					
					if (typeof currentTheme.commentTextSize !== 'undefined') {
						$('.user_theme_settings #gt-comments-text-size').val(currentTheme.commentTextSize);
					}
					
					if (typeof currentTheme.commentOfftopicTextSize !== 'undefined') {
						$('.user_theme_settings #gt-comments-offtopic-text-size').val(currentTheme.commentOfftopicTextSize);
					}
					
					if (typeof currentTheme.commentSpoilerTextSize !== 'undefined') {
						$('.user_theme_settings #gt-comments-spoiler-text-size').val(currentTheme.commentSpoilerTextSize);
					}
					
					if (typeof currentTheme.commentTurnOffTextShadow !== 'undefined') {
						$('.user_theme_settings #gt-comments-turn-off-text-shadow').val(currentTheme.commentTurnOffTextShadow);
					}
					
					if (typeof currentTheme.commentRateColorType !== 'undefined') {
						$('.user_theme_settings #gt-comments-rate-color-type').val(currentTheme.commentRateColorType);
					}
					/*
					if (typeof currentTheme.commentUpRateColor !== 'undefined') {
						$('.user_theme_settings #gt-comments-up-rate-color').val(currentTheme.commentUpRateColor);
					}
					
					if (typeof currentTheme.commentDownRateColor !== 'undefined') {
						$('.user_theme_settings #gt-comments-down-rate-color').val(currentTheme.commentDownRateColor);
					}
					*/
					if (typeof currentTheme.turnOffLastComments !== 'undefined') {
						$('.user_theme_settings #gt-turn-off-last-comments').val(currentTheme.turnOffLastComments);
					}
				}
			});
			
			$('input#gt-settings-save').live('click', function(){
				applySettings();
			});
			
			/* Plugin Info Block */
			
			
		};
		
		return new constructor();
	} )();
	
	/* our styles */
	var styles = $('<style type="text/css" />').appendTo('head');
	styles.html('.user_theme_block {\n\
background: #f0de39;\n\
background: -moz-linear-gradient(center top , #F0DE39 0%, #F0DE39 2%, #F9D857 50%, #F9D650 51%, #F9D650 100%) repeat scroll 0 0 transparent;\n\
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#f0de39), color-stop(2%,#f0de39), color-stop(50%,#f9d857), color-stop(51%,#f9d650), color-stop(100%,#f9d650));\n\
background: -webkit-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: -o-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: -ms-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
border-radius: 10px 10px 10px 10px;\n\
box-shadow: 0 0 3px 1px #F9E350 inset;\n\
margin: 0 0 1.5em;\n\
padding: 10px;\n\
position: relative;} \n\
.dnone {display:none;} \n\
.user_theme_current {font-weight: bold; cursor: pointer;}');
	
	var styles2 = $('<style type="text/css" />').appendTo('head');
	styles2.html('.plugin_info_block {\n\
background: #f0de39;\n\
background: -moz-linear-gradient(center top , #F0DE39 0%, #F0DE39 2%, #F9D857 50%, #F9D650 51%, #F9D650 100%) repeat scroll 0 0 transparent;\n\
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#f0de39), color-stop(2%,#f0de39), color-stop(50%,#f9d857), color-stop(51%,#f9d650), color-stop(100%,#f9d650));\n\
background: -webkit-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: -o-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: -ms-linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
background: linear-gradient(top, #f0de39 0%,#f0de39 2%,#f9d857 50%,#f9d650 51%,#f9d650 100%);\n\
border-radius: 10px 10px 10px 10px;\n\
box-shadow: 0 0 3px 1px #F9E350 inset;\n\
margin: 0 0 1.5em;\n\
padding: 10px;\n\
position: relative;}');
	
	/* our css fixes */
	var styles3 = $('<style type="text/css" />').appendTo('head');
	styles3.html('div.framed_popuper {\n\
left: 35%;\n\
min-width: 400px;\n\
width: inherit;\n\
box-shadow: 0 0 5px 3px #888888;\n\
max-width: 640px;\n\
}\n\
\n\
.framed_popuper .comment_user_text img.user_comment_img {max-width: 100%} \n\
.framed_popuper .framed_t {background: url(\'\') repeat scroll 0% 0% #FFF;}\n\
.framed_popuper .framed_m {background: url(\'\') repeat scroll 0% 0% #FFF;}\n\
.framed_popuper .framed_b {background: url(\'\') repeat scroll 0% 0% #FFF;}');
	
	var currentTheme = gtnamespace.theme.getCurrentTheme();
	
	window.prepareComments = function() {
		$('table.news_shortlist.gcs-news-table a, div.news_list .item h3 a, #ri_news .item h3 a, #ri_reviews .item h3 a, div.articles_list .item h3 a:not(.parent)').each(function(){
			var self = $(this);
			if (self.data('gsc_comments_on')) {
				return true;
			}
			self.data('gsc_comments_on',1);
			var object = self.attr('href');
			object = object.match(/reviews|articles|tools|results|news/gi);
			object = object != null ? object[0] : null;
			var commentString = $('<span></span>').attr('class', 'gcs_comments').css('display', 'block').html('&nbsp;');
			switch (object) {
				case 'tools':
				case 'articles':
				case 'reviews':
				case 'results':
					if (self.parents('.articles_list').length) {
						self.parents('.text').append(commentString);
					} else {
						self.parents('.item').append(commentString);
					}
					break;
				case 'news':
					if (self.parents('.item').length) {
						self.parents('.item').append(commentString);
					} else {
						self.parent('td').append(commentString);
					}
					break;
				default:
					return true;
					break;
			}
		});
	}
  
	/* last comment in our news table*/
	window.lastCommentsShow = function(onNewsPage) {
		$('table.news_shortlist.gcs-news-table a, div.news_list .item h3 a, #ri_news .item h3 a, div.articles_list .item h3 a:not(.parent)').each(function(){
			var self = $(this);
			var newsId = self.attr('href');
			if (newsId.indexOf("comments_block") == -1) {
				var object = newsId.match(/reviews|articles|tools|results/gi);
				object = object != null ? object[0] : null;
				switch (object) {
					case 'tools':
					case 'articles':
					case 'reviews':
					case 'results':
						return true;
						break;
				}
				
				newsId = newsId.match(/\d+/gi);
				newsId = newsId[0];
				$.post(
					'http://www.gametech.ru/cgi-bin/comments.pl',
					{
						action : 'ajax',
						id : newsId,
						option : 'news',
						sub_option : 'refresh'
					},
					function(res){
						if(res.status == 'ok') {
							$(res.content).find('img.userpic').each(function(){
								var imgPath = $(this).attr('src');
								if (imgPath.search('http://forum.ixbt.com/avatars/00000000.jpg') == 0) {
									$(this).attr('src', 'http://gametech.ru/resources/img/user/no_user_icon.gif');
								}
							});
							var lastComment = $(res.content).find('.commentaries .item:first');
							var userName = lastComment.find('a.username');
							userName.find('img').remove();
							userName = userName.html();
							if (userName != null) {
								if (onNewsPage) {
									if (!self.data('gsc_comments_on')) {
										self.data('gsc_comments_on',1);
										var commentStringS = $('<span></span>').attr('class', 'gcs_comments').css('display', 'block').html('&nbsp;');
										self.parents('.item').append(commentStringS);
									}
									var commentTime = lastComment.find('span.date').html();

									var commentString = '<span style="display:block;color:#5D5D5D;">Последний комментарий от '+userName+' '+commentTime+'</span>';
									self.parents('.item').find('.gcs_comments').html(commentString);
								} else {
									var commentTime = lastComment.find('span.date').html();
									commentTime = commentTime.substr((commentTime.indexOf(',')+1));

									var commentString = '<span style="display:block;color:#5D5D5D;">'+userName+''+commentTime+'</span>';
									if (self.parents('div.#ri_news').length) {
										self.parents('.item').find('.gcs_comments').html(commentString);
									} else {
										self.parent('td').find('.gcs_comments').html(commentString);
									}
								}
							}
						}
					},
					'json'
				);
			}
		});
	}
	
	/* last comment in "Обзоры" table*/
	window.lastCommentsReviewsTableShow = function() {
		$('#ri_reviews .item h3 a, div.news_list .item h3 a, div.articles_list .item h3 a:not(.parent)').each(function(){
			var self = $(this);
			var object = self.attr('href');
			var objectId = object.match(/\d+/gi);
			object = object.match(/reviews|articles|tools|results|news/gi);
			objectId = objectId[0];
			object = object[0];
			switch (object) {
				case 'tools':
					object = 'implement';
					break;
				case 'articles':
					object = 'article';
					break;
				case 'reviews':
					object = 'review';
					break;
				case 'results':
					object = 'results';
					break;
				default:
					return true;
					break;
			}

			
			$.post(
				'http://www.gametech.ru/cgi-bin/comments.pl',
				{
					action : 'ajax',
					id : objectId,
					option : object,
					sub_option : 'refresh'
				},
				function(res){
					if(res.status == 'ok') {
						$(res.content).find('img.userpic').each(function(){
							var imgPath = $(this).attr('src');
							if (imgPath.search('http://forum.ixbt.com/avatars/00000000.jpg') == 0) {
								$(this).attr('src', 'http://gametech.ru/resources/img/user/no_user_icon.gif');
							}
						});
						var lastComment = $(res.content).find('.commentaries .item:first');
						var userName = lastComment.find('a.username');
						userName.find('img').remove();
						userName = userName.html();
						if (userName != null) {
							if (self.parents('div.news_list').length || self.parents('div.articles_list').length) {
								var commentTime = lastComment.find('span.date').html();

								var commentString = '<span style="display:block;color:#5D5D5D;">Последний комментарий от '+userName+' '+commentTime+'</span>';
								self.parents('.item').find('.gcs_comments').html(commentString);
							} else {
								var commentTime = lastComment.find('span.date').html();

								var commentString = '<span style="display:block;color:#5D5D5D;">'+userName+' '+commentTime+'</span>';
								self.parents('.item').find('.gcs_comments').html(commentString);
							}
						}
					}
				},
				'json'
			);
			
		});
	}
	
if (!(window.location=='http://www.gametech.ru/')){
	$(document).ready(function(){
		if (window.location.pathname != '/news/') {
			$.ajax({
				url: "/cgi-bin/ajaxhtml.pl",data: {div_selected: "news"},
				cache: true,
				type: "GET",
				dataType: "html",
				success: function(curr_data, stat, xhr){
					var ourTableShortList=$('div#fresh_news_bottom', curr_data);
					var startPositionForRightNews=$('div.user_theme_block')[0] || $('div.user_logined_block')[0] || $('div.auth_actions')[0];
					$('#ri_reviews').insertAfter(startPositionForRightNews);
					ourTableShortList.find('table.news_shortlist').addClass('gcs-news-table');
					ourTableShortList.insertAfter(startPositionForRightNews);
					//$('h2.news').css({'color':'#487099', 'text-decoration':'underline'}).insertAfter(startPositionForRightNews);
					ourTableShortList.find('tr td:first-child').remove();
					var linkInTableTd=ourTableShortList.find('tr td a');
					for(var i=0;i<linkInTableTd.length;i++){
						if(linkInTableTd[i].href==window.location){
							linkInTableTd[i].parentNode.setAttribute('style','padding:5px; background:#48a2de;border-radius:5px;');
							linkInTableTd[i].setAttribute('style','color:white;text-decoration:none')
						}
					}
					var spanInTableTd=ourTableShortList.find('span.comments');
					spanInTableTd.find('i').remove();
					for(var j=0;j<spanInTableTd.length;j++){
						spanInTableTd[j].setAttribute('style','padding:0px');
					}

					if (currentTheme.turnOffLastComments != "true") {
						window.prepareComments();
						window.lastCommentsShow();
						window.lastCommentsReviewsTableShow();
					}
				}
			});
		}
		/*
		var ourTableShortList=$('table.news_shortlist');
		var startPositionForRightNews=$('div.user_theme_block')[0] || $('div.user_logined_block')[0] || $('div.auth_actions')[0];
		$('#ri_reviews').insertAfter(startPositionForRightNews);
		ourTableShortList.insertAfter(startPositionForRightNews);
		$('h2.news').css({'color':'#487099', 'text-decoration':'underline'}).insertAfter(startPositionForRightNews);
		ourTableShortList.find('tr td:first-child').remove();
		var linkInTableTd=ourTableShortList.find('tr td a');
		for(var i=0;i<linkInTableTd.length;i++){
			if(linkInTableTd[i].href==window.location){
				linkInTableTd[i].parentNode.setAttribute('style','padding:5px; background:#48a2de;border-radius:5px;');
				linkInTableTd[i].setAttribute('style','color:white;text-decoration:none')
			}
		}
		var spanInTableTd=ourTableShortList.find('span.comments');
		spanInTableTd.find('i').remove();
		for(var j=0;j<spanInTableTd.length;j++){
			spanInTableTd[j].setAttribute('style','padding:0px');
		}
		
		if (currentTheme.turnOffLastComments != "true") {
			window.prepareComments();
			window.lastCommentsShow();
			window.lastCommentsReviewsTableShow();
		}
		*/
	});

	function spacesForTags(txt){
		txt.replace("<b>", " <b>");
		txt.replace("<i>", " <i>");
		txt.replace("<noindex>", " <noindex>");
		txt.replace("</b>", "</b> ");
		txt.replace("</i>", "</i> ");
		txt.replace("</noindex>", "</noindex> ");
	};

	var OurCommunityComment=function(){
		if (currentTheme.commentBodyGradient == "true") {
			var grdCS = currentTheme.commentBodyColorStart;
			var grdCE = currentTheme.commentBodyColorEnd;
			var backgroundCommentBodyGradient={
				'backgroundMoz': '-moz-linear-gradient(left,  '+grdCS+' 0%, '+grdCS+' 46%, '+grdCE+' 100%)',
				'backgroundWK1': '-webkit-gradient(linear, left top, right top, color-stop(0%,'+grdCS+'), color-stop(46%,'+grdCS+'), color-stop(100%,'+grdCE+'))',
				'backgroundWK2': '-webkit-linear-gradient(left,  '+grdCS+' 0%,'+grdCS+' 46%,'+grdCE+' 100%)',
				'backgroundO': '-o-linear-gradient(left,  '+grdCS+' 0%,'+grdCS+' 46%,'+grdCE+' 100%)',
				'backgroundW3c': 'linear-gradient(left,  '+grdCS+' 0%,'+grdCS+' 46%,'+grdCE+' 100%)'
			};
			for (var ourBackground in backgroundCommentBodyGradient){
				$('.commentaries .item .body').css('background',backgroundCommentBodyGradient[ourBackground]);
			}
		}
		$('.commentaries .item .body').css('border-radius','3px');
		$('.commentaries .item .head').css({'height': '20px','background':currentTheme.commentBodyColorEnd,'margin': '25px 0 25px 0'});
		$('.commentaries .item .head .userpic').css({'background':currentTheme.commentBodyColorEnd,'width':'50px','height':'50px', 'top': '-20px', 'padding':'3px','borderRadius':'3px','border':'1px solid #dbe7ef'});
		
		/* user picture in comment */
		$('.commentaries .item .body a.big_img img').each(function(){
			var imgPath = $(this).attr('src');
			if (imgPath.search('/userpics') == 0) {
				imgPath = $(this).parent('a').attr('href');
				$(this).attr('src', imgPath);
			}
		});
		$('.commentaries .item .head a.username img.userpic').each(function(){
			var imgPath = $(this).attr('src');
			if (imgPath.search('http://forum.ixbt.com/avatars/00000000.jpg') == 0) {
				$(this).attr('src', 'http://gametech.ru/resources/img/user/no_user_icon.gif');
			}
		});
	}
	OurCommunityComment();


	/* our css fixes */
	var styles4 = $('<style type="text/css" />').appendTo('head');
	styles4.html('\
.news_list .item {font-size: '+currentTheme.newsTextSizeBody+'px !important;}\n\
.news_list .item h3 {font-size: '+currentTheme.newsTextSizeHeader+'px !important; font-weight: bold !important;}\n\
div.g960 {background: #F9FBFB !important; font-family: '+currentTheme.fontFamily+' !important;}\n\
.news_list .commentaries .item div.spoiler {background: #F9FBFB !important;}\n\
.news_list .item .clear {border: none !important;}\n\
.news_list .item div.offtopic_cs {font-size:'+currentTheme.commentOfftopicTextSize+'px !important;}\n\
.news_list .item div.offtopic_cs .reply, .news_list .item div.offtopic_cs .reply b, .news_list .item div.offtopic_cs .reply a {border: none !important;}\n\
.news_list .item div.offtopic_cs .reply b, .news_list .item div.offtopic_cs .reply a {color: #444444 !important;}\n\
.commentaries .item .head .username {padding-left: 60px !important; display:inline-block !important; padding-top: 0px !important;}\n\
.commentaries .item .body .reply {margin: 0px !important; borderRadius: 3px !important;}\n\
div.offtopic_cs {background-color: #EDEDED; border: 1px solid #CDCDCD; color: #ADADAD; padding: 2px;}\n\
.news_shortlist a {font-size: 12px !important;}\n\
.right_block_content div.item a, .right_block_content h3 a {font-size: 12px !important;}\n\
div.spoiler {font-size: '+currentTheme.commentSpoilerTextSize+'px !important;}\n\
\n\
.news_list .commentaries .item {font-size:'+currentTheme.commentTextSize+'px !important;}\n\
.news_list .commentaries .item .clear {border: none;}\n\
.news_list .commentaries .item div.offtopic, .news_list .commentaries .item div.offtopic_cs {font-size:'+currentTheme.commentOfftopicTextSize+'px !important;}\n\
.news_list .commentaries .item div.offtopic .reply, .news_list .commentaries .item div.offtopic .reply b, .news_list .commentaries .item div.offtopic .reply a {border: none !important;}\n\
.news_list .commentaries .item div.offtopic_cs .reply, .news_list .commentaries .item div.offtopic_cs .reply b, .news_list .commentaries .item div.offtopic_cs .reply a {border: none !important;}\n\
.news_list .commentaries .item div.offtopic .reply b, .news_list .commentaries .item div.offtopic .reply a {color:#444444;}\n\
.news_list .commentaries .item div.offtopic_cs .reply b, .news_list .commentaries .item div.offtopic_cs .reply a {color:#444444;}\n\
\n\
.comment_user_text .clear {border: none;}\n\
.comment_user_text div.offtopic, .comment_user_text div.offtopic_cs {font-size:'+currentTheme.commentOfftopicTextSize+'px !important;}\n\
.comment_user_text div.offtopic .reply, .comment_user_text div.offtopic .reply b, .comment_user_text div.offtopic .reply a {border: none !important;}\n\
.comment_user_text div.offtopic_cs .reply, .comment_user_text div.offtopic_cs .reply b, .comment_user_text div.offtopic_cs .reply a {border: none !important;}\n\
.comment_user_text div.offtopic .reply b, .comment_user_text div.offtopic .reply a {color:#444444;}\n\
.comment_user_text div.offtopic_cs .reply b, .comment_user_text div.offtopic_cs .reply a {color:#444444;}\n\
.comment_user_text div.offtopic .reply, .comment_user_text div.offtopic_cs .reply {font-style: italic; font-size: 0.9em; text-shadow: 0 1px 0 #fff; color: #444444;}\n\
.comment_user_text div.offtopic, .comment_user_text div.offtopic_cs {background-color: #EDEDED; border: 1px solid #CDCDCD; color: #ADADAD; padding: 2px;}\n\
\n\
');

	$('div.offtopic').removeClass('offtopic').addClass('offtopic_cs');
	
	//$('.news_list .item').css('font-size', currentTheme.newsTextSizeBody+'px');
	//$('.news_list .item h3').css({'font-size':currentTheme.newsTextSizeHeader+'px','font-weight':'bold'});
	//$('div.g960').css({'background': '#F9FBFB','font-family':currentTheme.fontFamily});
	//$('.news_list .commentaries .item div.spoiler').css('background', '#F9FBFB');
	//$('.news_list .item .clear').css({'border': 'none'});
	//$('.news_list .item div.offtopic').css({'font-size': currentTheme.commentOfftopicTextSize+'px !important'});
	//$('.news_list .item div.offtopic .reply, .news_list .item div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'border': 'none !important'});
	//$('.news_list .item div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'color':'#444444'});
	//$('.commentaries .item .head .username').css({'padding-left':'60px','display':'inline-block','padding-top':'0px'});
	//$('.commentaries .item .body .reply').css({'margin':'0px','borderRadius':'3px'});
	//$('div.offtopic').css({'background-color':'#EDEDED','border':'1px solid #CDCDCD','color':'#ADADAD','padding':'2px'}).removeClass('offtopic');
	/*
	//$('.commentaries .item .body noindex, .commentaries .item .body b, .commentaries .item .body i').css({'padding':'5px'});
	//$('.commentaries .item .body').each(function(){var txt = $(this).html();spacesForTags(txt);});
	//$('.comment_user_text').each(function(){var txt = $(this).html();spacesForTags(txt);});
	*/
   
	//$('.news_shortlist a').css({'font-size':'12px'});
	//$('.right_block_content div.item a, .right_block_content h3 a').css({'font-size':'12px'});

	/* spoiler div styles*/
	//$('div.spoiler').css({'font-size':currentTheme.commentSpoilerTextSize+'px'});
	
	/* rate type */
	if (currentTheme.commentRateColorType == 'color') {
		$('.commentaries .item .head').each(function(){
			var ratingVal = $(this).find('.comment_rating .cr_value').html();
			ratingVal = parseInt(ratingVal);
			var calcRat = ratingVal;
			var maxColorHex = 242;
			if (ratingVal > 0) {
				calcRat = (ratingVal > 20 ? 20 : ratingVal);
				var colorA = [(maxColorHex - calcRat * 3), maxColorHex, (maxColorHex - calcRat * 3)];
				var colorS = 'rgb(' + colorA[0] + ',' + colorA[1] + ',' + colorA[2] + ')';
				$(this).css({'background-color':colorS});
			} else if (ratingVal < 0) {
				calcRat = (ratingVal < -20 ? -20 : ratingVal) * (-1);
				var colorA = [maxColorHex, (maxColorHex - calcRat * 3), (maxColorHex - calcRat * 3)];
				var colorS = 'rgb(' + colorA[0] + ',' + colorA[1] + ',' + colorA[2] + ')';
				$(this).css({'background-color':colorS});
			}
		});
	} else if (currentTheme.commentRateColorType == 'hidden') {
		$('.commentaries .item .head .comment_rating').css({'display':'none'});
	}

	/* text shadow */
	if (currentTheme.commentTurnOffTextShadow == 'true') {
		$('.commentaries .item .head').css({'text-shadow':'none'});
	}

	$('div#comments_block_place').live('DOMNodeInserted', function(){
		OurCommunityComment();
		//$('.news_list .commentaries .item').css('font-size', currentTheme.commentTextSize+'px');
		//$('.news_list .commentaries .item .clear').css({'border': 'none'});
		//$('.news_list .commentaries .item div.offtopic').css({'font-size':currentTheme.commentOfftopicTextSize+'px !important'});
		//$('.news_list .commentaries .item div.offtopic .reply, .news_list .item div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'border': 'none !important'});
		//$('.news_list .commentaries .item div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'color':'#444444'});
		//$('.commentaries .item .head .username').css({'padding-left':'60px','display':'inline-block','padding-top':'0px'});
		//$('.commentaries .item .body .reply').css({'margin':'0px','borderRadius':'3px'});
		//$('.news_list .commentaries .item div.offtopic').css({'background-color':'#EDEDED','border':'1px solid #CDCDCD','color':'#ADADAD','padding':'2px'}).removeClass('offtopic');
		$('.news_list .commentaries .item div.offtopic').removeClass('offtopic').addClass('offtopic_cs');
		
		//was commented
		//$('.commentaries .item .body noindex, .commentaries .item .body b, .commentaries .item .body i').css({'padding':'5px'});
		//$('.commentaries .item .body').each(function(){var txt = $(this).html();spacesForTags(txt);});
		//$('.comment_user_text').each(function(){var txt = $(this).html();spacesForTags(txt);});

		//$('.news_list .commentaries .item div.spoiler').css('background', '#F9FBFB');

		/* spoiler div styles*/
		//$('div.spoiler').css({'font-size':currentTheme.commentSpoilerTextSize+'px'});
		
		/* rate type */
		if (currentTheme.commentRateColorType == 'color') {
			$('.commentaries .item .head').each(function(){
				var ratingVal = $(this).find('.comment_rating .cr_value').html();
				ratingVal = parseInt(ratingVal);
				var calcRat = ratingVal;
				var maxColorHex = 242;
				if (ratingVal > 0) {
					calcRat = (ratingVal > 20 ? 20 : ratingVal);
					var colorA = [(maxColorHex - calcRat * 3), maxColorHex, (maxColorHex - calcRat * 3)];
					var colorS = 'rgb(' + colorA[0] + ',' + colorA[1] + ',' + colorA[2] + ')';
					$(this).css({'background-color':colorS});
				} else if (ratingVal < 0) {
					calcRat = (ratingVal < -20 ? -20 : ratingVal) * (-1);
					var colorA = [maxColorHex, (maxColorHex - calcRat * 3), (maxColorHex - calcRat * 3)];
					var colorS = 'rgb(' + colorA[0] + ',' + colorA[1] + ',' + colorA[2] + ')';
					$(this).css({'background-color':colorS});
				}
			});
		} else if (currentTheme.commentRateColorType == 'hidden') {
			$('.commentaries .item .head .comment_rating').css({'display':'none'});
		}
		
		/* text shadow */
		if (currentTheme.commentTurnOffTextShadow == 'true') {
			$('.commentaries .item .head').css({'text-shadow':'none'});
		}
	});
	
	$('div#popuper_message_field').live('DOMNodeInserted', function(){
		//$('.comment_user_text .clear').css({'border': 'none'});
		//$('.comment_user_text div.offtopic').css({'font-size': currentTheme.commentOfftopicTextSize+'px !important'});
		//$('.comment_user_text div.offtopic .reply, .news_list .item div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'border': 'none !important'});
		//$('.comment_user_text div.offtopic .reply b, .news_list .item div.offtopic .reply a').css({'color':'#444444'});
		//$('.comment_user_text noindex, .comment_user_text b, .comment_user_text i').css({'padding':'5px'});
		//$('.commentaries .item .body').each(function(){var txt = $(this).html();spacesForTags(txt);});
		//$('.comment_user_text').each(function(){var txt = $(this).html();spacesForTags(txt);});
		//$('.comment_user_text div.offtopic').css({'background-color':'#EDEDED','border':'1px solid #CDCDCD','color':'#ADADAD','padding':'2px'}).removeClass('offtopic').addClass('offtopic_cs');
		$('.comment_user_text div.offtopic').removeClass('offtopic').addClass('offtopic_cs');
	});

		var ourCommunityPic_1='http://www.gametech.ru/userpics/717497/upload/editor_buttons.png';
		$.ajax({
			url:ourCommunityPic_1,
			type:'HEAD',
			success:
				function(){
					$('a.tb').css({'background-image':'url('+ourCommunityPic_1+')'});
					$('div#comments_block_place').live('DOMNodeInserted', function(){
						$('a.tb').css({'background-image':'url('+ourCommunityPic_1+')'});
					})
				}
		});

	$('div.comment_content').live('DOMNodeInserted', function(ev){
		/**
		 * Блок редактирования комментария - чиним https + вставка в нужное окно
		 */
	   if($('.comment_update').length > 0){
			$('.comment_update .tb_href').attr('onclick',"window.ixbtstyleSJ(4, 'commentUpd');");
			$('.comment_update').parent('div').parent('div').find('#url_c').find('input[name="confirm"]').attr('onclick',"window.check_url_tagSJ('commentUpd');");
			$('.comment_update').parent('div').parent('div').find('#url_c').find('input[name="cancle"]').attr('onclick',"window.close_url_tagSJ('commentUpd');");
			$('.comment_update .button_send').css({'background-position':'0 -30px','color':'#FFFFFF', 'cursor':'pointer'});
			$('.comment_update .button_cancel').css({'cursor':'pointer'});
		}
	});
	
	$('div#comments_block_place').live('DOMNodeInserted', function(ev){
		/**
		 * Блок добавления комментария - чиним https + вставка в нужное окно
		 */
		if($('.comment_tools:not(.gcs_comment_tools)').length > 0){
			$('.comment_tools:not(.gcs_comment_tools)').each(function(){
				var self = $(this);
				if ($('form.comment_update', self).length == 0) {
					$('.tb_href', self).attr('onclick',"window.ixbtstyleSJ(4, 'comment');");
					self.parent('div').find('#url_c').find('input[name="confirm"]').attr('onclick',"window.check_url_tagSJ('comment');");
					self.parent('div').find('#url_c').find('input[name="cancle"]').attr('onclick',"window.close_url_tagSJ('comment');");
					$('.button_send', self).css({'background-position':'0 -30px','color':'#FFFFFF', 'cursor':'pointer'});
					self.addClass('gcs_comment_tools');
				}
			});
		}
		
		/**
		 * чиним https в комментах, кто без плагина
		 */
		$('.body.comment_content').each(function(){
			var self = $(this);
			$('a[href^="http://https://"]', self).each(function(){
				var hrefTMP = this.href;
				hrefTMP = hrefTMP.replace('http://https://', 'https://');
				this.href = hrefTMP;
			});
			$('a[href^="http://https//"]', self).each(function(){
				var hrefTMP = this.href;
				hrefTMP = hrefTMP.replace('http://https//', 'https://');
				this.href = hrefTMP;
			});
		});
	});
	
	/**
	 * закоменчены
	 */
	//window.prepareComments();
	//window.lastCommentsShow();
	//window.lastCommentsReviewsTableShow();
} else {
	$('div.g960').css({'background': '#F9FBFB','font-family':currentTheme.fontFamily,'font-size':'12px'});
	$('div.left_col ul.news_shortlist-list').load('http://www.gametech.ru/cgi-bin/ajaxhtml.pl?div_selected=news div#fresh_news_bottom ul.news_shortlist-list', function(res){
		$('div.left_col table.news_shortlist').addClass('gcs-news-table');
		if (currentTheme.turnOffLastComments != "true") {
			window.prepareComments();
			window.lastCommentsShow();
			window.lastCommentsReviewsTableShow();
		}
	});
	$('div.more_news').remove();
	$('div.breadcrumbs').remove();
	$('div.news_block').css('margin','0 0 0 0');
 }
 
if (window.location.pathname == '/news/') {
	window.prepareComments();
	window.lastCommentsShow(true);
}

	/* инициализация (отрисовка и пр) блока тем GT */
	gtnamespace.theme.init();
	/**
	 * @todo баннерко резалка
	$('.banner_240x400').remove();
	$(window).load(function(){
		$('.play_asia').remove();
		$('.ya_partner_0').remove();
	});
	*/


	/* функции для правильной работы вставки линки в редактировани комментария */
	window.ixbtstyleSJ = function (bbnumber, name){
		var txtarea = get_editfield(name);
		if(txtarea == null || !txtarea){
			return;
		}
		if(bbnumber == 4){
			var jq_selector = '#'+name;
			var ctr_form = $(jq_selector).parent('form').parent('div').parent('div').find('#url_c').get(0);
			//var ctr_form = $('.comment_update').parent('div').parent('div').find('#url_c');
			// Если фрагмент текста был выделен, то добавляем его в виде названия ссылки
			var theSelection = '';

			if((clientVer >= 4) && is_ie && is_win){
				theSelection = document.selection.createRange().text;
			}

			else if(txtarea.selectionEnd){
				theSelection = mozExtractSelection(txtarea);
			}

			if(theSelection.indexOf('http://') == -1 && theSelection.indexOf('https://') == -1){
				$(ctr_form).find('#url_title').val(theSelection);
				$(ctr_form).find('#url_href').val('');
			}else{
				if (theSelection.indexOf('https://') !== -1) {
					theSelection = theSelection.replace('https://', 'http://');
				}
				$(ctr_form).find('#url_title').val(theSelection);
				$(ctr_form).find('#url_href').val(theSelection);
			}

			if(!ctr_form){
				return;	
			}

			if(ctr_form.style.display == 'none'){

				var x  = GetLeftPos(txtarea);
				var y =  GetTopPos(txtarea);	

				ctr_form.style.left = x + 'px';
				ctr_form.style.top = y + 'px';
				ctr_form.style.display = 'block';
			}
		}
	};
	
	window.check_url_tagSJ = function(name){
		var jq_selector = '#'+name;
		var ctr_form = $(jq_selector).parent('form').parent('div').parent('div').find('#url_c');
		//var ctr_form = $('.comment_update').parent('div').parent('div').find('#url_c');
		var href = ctr_form.find('#url_href').get(0);
		var title = ctr_form.find('#url_title').get(0);
		var result = '';

		if((!title.value && !href.value) || (title.value && !href.value)){
			result = '';
		}else{
			if(!title.value && href.value){
				title.value = href.value;
			}
			if(!href.value.match('http://') && !href.value.match('https://')){
				href.value = 'http://' + href.value;
			}
			if(href.value.match('https://')) {
				href.value = href.value.replace('https://','http://');
			}
			result = '[url href=' + href.value + ']' + title.value+ '[/url]';
		}

		var txtarea = get_editfield(name);
		if(txtarea == null || !txtarea){
			return;
		}


		if(result){
			var theSelection = '';
			var b_type = 0;
			// Определяем было ли сделано выделение и определяем тип браузера
			if((clientVer >= 4) && is_ie && is_win){
				theSelection = document.selection.createRange().text;
			}else if(txtarea.selectionEnd){
				theSelection = mozExtractSelection(txtarea);
				b_type = 1;
			}

			// Если выделения не было то добавляем в конец строки, иначе заменяем выделенный текст
			if(! theSelection){
				txtarea.value += result;
			}else{
				if(! b_type){
					document.selection.createRange().text = result;
				}else{
					mozWrapReplace(txtarea, result);
				}
			}
		}

		txtarea.focus();

		if(!ctr_form){
			return;
		}

		ctr_form.get(0).style.display = 'none';
	};
	
	window.close_url_tagSJ = function(name){
		var jq_selector = '#'+name;
		var ctr_form = $(jq_selector).parent('form').parent('div').parent('div').find('#url_c');
		//var ctr_form = $('.comment_update').parent('div').parent('div').find('#url_c');
		ctr_form.find('#url_href').val('');
		ctr_form.find('#url_title').val('');

		if(!ctr_form){
			return;
		}

		ctr_form.get(0).style.display = 'none';
		var txtarea = get_editfield(name);

		if(txtarea){
			txtarea.focus();
		}
	};
}

addJQuery(main);


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-35688381-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();