/**
 * This plug-in for DataTables represents the ultimate option in extensibility
 * for sorting date / time strings correctly. It uses
 * [Moment.js](http://momentjs.com) to create automatic type detection and
 * sorting plug-ins for DataTables based on a given format. This way, DataTables
 * will automatically detect your temporal information and sort it correctly.
 *
 * For usage instructions, please see the DataTables blog
 * post that [introduces it](//datatables.net/blog/2014-12-18).
 *
 * @name Ultimate Date / Time sorting
 * @summary Sort date and time in any format using Moment.js
 * @author [Allan Jardine](//datatables.net)
 * @depends DataTables 1.10+, Moment.js 1.7+
 *
 * @example
 *    jQuery.fn.dataTable.moment( 'HH:mm MMM D, YY' );
 *    jQuery.fn.dataTable.moment( 'dddd, MMMM Do, YYYY' );
 *
 *    $('#example').DataTable();
 */

(function (factory) {
	if (typeof define === "function" && define.amd) {
		define(["jquery", "moment", "datatables.net"], factory);
	} else {
		factory(jQuery, moment);
	}
}(function (jQuery, moment) {

jQuery.fn.dataTable.moment = function ( format, locale, reverseEmpties ) {
	var types = jQuery.fn.dataTable.ext.type;

	// Add type detection
	types.detect.unshift( function ( d ) {
		if ( d ) {
			// Strip HTML tags and newline characters if possible
			if ( d.replace ) {
				d = d.replace(/(<.*?>)|(\r?\n|\r)/g, '');
			}

			// Strip out surrounding white space
			d = jQuery.trim( d );
		}

		// Null and empty values are acceptable
		if ( d === '' || d === null ) {
			return 'moment-'+format;
		}



		return moment( d, format, locale, true ).isValid() ?
			'moment-'+format :
			null;
	} );


	// Add sorting method - use an integer for the sorting
	types.order[ 'moment-'+format+'-pre' ] = function ( d ) {
		if ( d ) {
			// Strip HTML tags and newline characters if possible
			if ( d.replace ) {
				d = d.replace(/(<.*?>)|(\r?\n|\r)/g, '');
			}

			// Strip out surrounding white space
			d = jQuery.trim( d );
		}

		return !moment(d, format, locale, true).isValid() ?
			(reverseEmpties ? -Infinity : Infinity) :
			parseInt( moment( d, format, locale, true ).format( 'x' ), 10 );
	};
};

}));

;/**
 * Data can often be a complicated mix of numbers and letters (file names
 * are a common example) and sorting them in a natural manner is quite a
 * difficult problem.
 * 
 * Fortunately a deal of work has already been done in this area by other
 * authors - the following plug-in uses the [naturalSort() function by Jim
 * Palmer](http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support) to provide natural sorting in DataTables.
 *
 *  @name Natural sorting
 *  @summary Sort data with a mix of numbers and letters _naturally_.
 *  @author [Jim Palmer](http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support)
 *  @author [Michael Buehler] (https://github.com/AnimusMachina)
 *
 *  @example
 *    $('#example').dataTable( {
 *       columnDefs: [
 *         { type: 'natural', targets: 0 }
 *       ]
 *    } );
 *
 *    Html can be stripped from sorting by using 'natural-nohtml' such as
 *
 *    $('#example').dataTable( {
 *       columnDefs: [
 *    	   { type: 'natural-nohtml', targets: 0 }
 *       ]
 *    } );
 *
 */

(function() {

/*
 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
 * See: http://js-naturalsort.googlecode.com/svn/trunk/naturalSort.js
 */
function naturalSort (a, b, html) {
	var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
		sre = /(^[ ]*|[ ]*$)/g,
		dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
		hre = /^0x[0-9a-f]+$/i,
		ore = /^0/,
		htmre = /(<([^>]+)>)/ig,
		// convert all to strings and trim()
		x = a.toString().replace(sre, '') || '',
		y = b.toString().replace(sre, '') || '';
		// remove html from strings if desired
		if (!html) {
			x = x.replace(htmre, '');
			y = y.replace(htmre, '');
		}
		// chunk/tokenize
	var	xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
		yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
		// numeric, hex or date detection
		xD = parseInt(x.match(hre), 10) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
		yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null;

	// first try and sort Hex codes or Dates
	if (yD) {
		if ( xD < yD ) {
			return -1;
		}
		else if ( xD > yD )	{
			return 1;
		}
	}

	// natural sorting through split numeric strings and default strings
	for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
		// find floats not starting with '0', string or 0 if not defined (Clint Priest)
		var oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc], 10) || xN[cLoc] || 0;
		var oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc], 10) || yN[cLoc] || 0;
		// handle numeric vs string comparison - number < string - (Kyle Adams)
		if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
			return (isNaN(oFxNcL)) ? 1 : -1;
		}
		// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
		else if (typeof oFxNcL !== typeof oFyNcL) {
			oFxNcL += '';
			oFyNcL += '';
		}
		if (oFxNcL < oFyNcL) {
			return -1;
		}
		if (oFxNcL > oFyNcL) {
			return 1;
		}
	}
	return 0;
}

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
	"natural-asc": function ( a, b ) {
		return naturalSort(a,b,true);
	},

	"natural-desc": function ( a, b ) {
		return naturalSort(a,b,true) * -1;
	},

	"natural-nohtml-asc": function( a, b ) {
		return naturalSort(a,b,false);
	},

	"natural-nohtml-desc": function( a, b ) {
		return naturalSort(a,b,false) * -1;
	}
} );

}());

;(function(){var e,n={},t="en",r=null,i="0,0",a="undefined"!=typeof module&&module.exports;function l(e){this._value=e}function u(e,n,t,r){var i,a,l=Math.pow(10,n);return a=(t(e*l)/l).toFixed(n),r&&(i=new RegExp("0{1,"+r+"}$"),a=a.replace(i,"")),a}function o(e,r,i,a){var l,u,o,f,s;return r.indexOf("$")>-1?l=function(e,r,i,a){var l,u,o=r.indexOf("$"),f=r.indexOf("("),s=r.indexOf("-"),h="",d=a||n[t].currency.symbol;r.indexOf(" $")>-1?(h=" ",r=r.replace(" $","")):r.indexOf("$ ")>-1?(h=" ",r=r.replace("$ ","")):r=r.replace("$","");u=c(e._value,r,i),o<=1?u.indexOf("(")>-1||u.indexOf("-")>-1?(u=u.split(""),l=1,(o<f||o<s)&&(l=0),u.splice(l,0,d+h),u=u.join("")):u=d+h+u:u.indexOf(")")>-1?((u=u.split("")).splice(-1,0,h+d),u=u.join("")):u=u+h+d;return u}(e,r,i,a):r.indexOf("%")>-1?l=function(e,n,t){var r,i="",a=100*e._value;n.indexOf(" %")>-1?(i=" ",n=n.replace(" %","")):n=n.replace("%","");(r=c(a,n,t)).indexOf(")")>-1?((r=r.split("")).splice(-1,0,i+"%"),r=r.join("")):r=r+i+"%";return r}(e,r,i):r.indexOf(":")>-1?(u=e,o=Math.floor(u._value/60/60),f=Math.floor((u._value-60*o*60)/60),s=Math.round(u._value-60*o*60-60*f),l=o+":"+(f<10?"0"+f:f)+":"+(s<10?"0"+s:s)):l=c(e._value,r,i),l}function f(e,i){var a,l,u,o,f,c=i,s=["KB","MB","GB","TB","PB","EB","ZB","YB"],h=!1;if(i.indexOf(":")>-1)e._value=function(e){var n=e.split(":"),t=0;3===n.length?(t+=60*Number(n[0])*60,t+=60*Number(n[1]),t+=Number(n[2])):2===n.length&&(t+=60*Number(n[0]),t+=Number(n[1]));return Number(t)}(i);else if(i===r)e._value=0;else{for("."!==n[t].delimiters.decimal&&(i=i.replace(/\./g,"").replace(n[t].delimiters.decimal,".")),a=new RegExp("[^a-zA-Z]"+n[t].abbreviations.thousand+"(?:\\)|(\\"+n[t].currency.symbol+")?(?:\\))?)?$"),l=new RegExp("[^a-zA-Z]"+n[t].abbreviations.million+"(?:\\)|(\\"+n[t].currency.symbol+")?(?:\\))?)?$"),u=new RegExp("[^a-zA-Z]"+n[t].abbreviations.billion+"(?:\\)|(\\"+n[t].currency.symbol+")?(?:\\))?)?$"),o=new RegExp("[^a-zA-Z]"+n[t].abbreviations.trillion+"(?:\\)|(\\"+n[t].currency.symbol+")?(?:\\))?)?$"),f=0;f<=s.length&&!(h=i.indexOf(s[f])>-1&&Math.pow(1024,f+1));f++);e._value=(h||1)*(c.match(a)?Math.pow(10,3):1)*(c.match(l)?Math.pow(10,6):1)*(c.match(u)?Math.pow(10,9):1)*(c.match(o)?Math.pow(10,12):1)*(i.indexOf("%")>-1?.01:1)*((i.split("-").length+Math.min(i.split("(").length-1,i.split(")").length-1))%2?1:-1)*Number(i.replace(/[^0-9\.]+/g,"")),e._value=h?Math.ceil(e._value):e._value}return e._value}function c(e,i,a){var l,o,f,c,s,h,d=!1,p=!1,v=!1,b="",m=!1,g=!1,x=!1,w=!1,y=!1,O="",M="",_=Math.abs(e),B=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],N="",$=!1;if(0===e&&null!==r)return r;if(i.indexOf("(")>-1?(d=!0,i=i.slice(1,-1)):i.indexOf("+")>-1&&(p=!0,i=i.replace(/\+/g,"")),i.indexOf("a")>-1&&(m=i.indexOf("aK")>=0,g=i.indexOf("aM")>=0,x=i.indexOf("aB")>=0,w=i.indexOf("aT")>=0,y=m||g||x||w,i.indexOf(" a")>-1?(b=" ",i=i.replace(" a","")):i=i.replace("a",""),_>=Math.pow(10,12)&&!y||w?(b+=n[t].abbreviations.trillion,e/=Math.pow(10,12)):_<Math.pow(10,12)&&_>=Math.pow(10,9)&&!y||x?(b+=n[t].abbreviations.billion,e/=Math.pow(10,9)):_<Math.pow(10,9)&&_>=Math.pow(10,6)&&!y||g?(b+=n[t].abbreviations.million,e/=Math.pow(10,6)):(_<Math.pow(10,6)&&_>=Math.pow(10,3)&&!y||m)&&(b+=n[t].abbreviations.thousand,e/=Math.pow(10,3))),i.indexOf("b")>-1)for(i.indexOf(" b")>-1?(O=" ",i=i.replace(" b","")):i=i.replace("b",""),f=0;f<=B.length;f++)if(l=Math.pow(1024,f),o=Math.pow(1024,f+1),e>=l&&e<o){O+=B[f],l>0&&(e/=l);break}return i.indexOf("o")>-1&&(i.indexOf(" o")>-1?(M=" ",i=i.replace(" o","")):i=i.replace("o",""),M+=n[t].ordinal(e)),i.indexOf("[.]")>-1&&(v=!0,i=i.replace("[.]",".")),c=e.toString().split(".")[0],s=i.split(".")[1],h=i.indexOf(","),s?(c=(N=s.indexOf("[")>-1?u(e,(s=(s=s.replace("]","")).split("["))[0].length+s[1].length,a,s[1].length):u(e,s.length,a)).split(".")[0],N=N.split(".")[1].length?n[t].delimiters.decimal+N.split(".")[1]:"",v&&0===Number(N.slice(1))&&(N="")):c=u(e,null,a),c.indexOf("-")>-1&&(c=c.slice(1),$=!0),h>-1&&(c=c.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+n[t].delimiters.thousands)),0===i.indexOf(".")&&(c=""),(d&&$?"(":"")+(!d&&$?"-":"")+(!$&&p?"+":"")+c+N+(M||"")+(b||"")+(O||"")+(d&&$?")":"")}function s(e){var n=e.toString().split(".");return n.length<2?1:Math.pow(10,n[1].length)}function h(){return Array.prototype.slice.call(arguments).reduce(function(e,n){var t=s(e),r=s(n);return t>r?t:r},-1/0)}(e=function(n){return e.isNumeral(n)?n=n.value():0===n||void 0===n?n=0:Number(n)||(n=e.fn.unformat(n)),new l(Number(n))}).version="1.5.3",e.isNumeral=function(e){return e instanceof l},e.language=function(r,i){if(!r)return t;if(r&&!i){if(!n[r])throw new Error("Unknown language : "+r);t=r}var a;return!i&&n[r]||(a=i,n[r]=a),e},e.languageData=function(e){if(!e)return n[t];if(!n[e])throw new Error("Unknown language : "+e);return n[e]},e.language("en",{delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(e){var n=e%10;return 1==~~(e%100/10)?"th":1===n?"st":2===n?"nd":3===n?"rd":"th"},currency:{symbol:"$"}}),e.zeroFormat=function(e){r="string"==typeof e?e:null},e.defaultFormat=function(e){i="string"==typeof e?e:"0.0"},"function"!=typeof Array.prototype.reduce&&(Array.prototype.reduce=function(e,n){"use strict";if(null===this||void 0===this)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof e)throw new TypeError(e+" is not a function");var t,r,i=this.length>>>0,a=!1;for(1<arguments.length&&(r=n,a=!0),t=0;i>t;++t)this.hasOwnProperty(t)&&(a?r=e(r,this[t],t,this):(r=this[t],a=!0));if(!a)throw new TypeError("Reduce of empty array with no initial value");return r}),e.fn=l.prototype={clone:function(){return e(this)},format:function(e,n,t){return o(this,e||i,void 0!==n?n:Math.round,t||null)},unformat:function(e){return"[object Number]"===Object.prototype.toString.call(e)?e:f(this,e||i)},value:function(){return this._value},valueOf:function(){return this._value},set:function(e){return this._value=Number(e),this},add:function(e){var n=h.call(null,this._value,e);return this._value=[this._value,e].reduce(function(e,t,r,i){return e+n*t},0)/n,this},subtract:function(e){var n=h.call(null,this._value,e);return this._value=[e].reduce(function(e,t,r,i){return e-n*t},this._value*n)/n,this},multiply:function(e){return this._value=[this._value,e].reduce(function(e,n,t,r){var i=h(e,n);return e*i*(n*i)/(i*i)},1),this},divide:function(e){return this._value=[this._value,e].reduce(function(e,n,t,r){var i=h(e,n);return e*i/(n*i)}),this},difference:function(n){return Math.abs(e(this._value).subtract(n).value())}},a&&(module.exports=e),"undefined"==typeof ender&&(this.numeral=e),"function"==typeof define&&define.amd&&define([],function(){return e})}).call(this);
;(function ($, app) {
	$(document).ready(function () {
		app.initTablesOnPage();
	});
}(window.jQuery, window.supsystic.Tables));

;(function($) {

	$.sNotify = function(options) {
		console.log('1');
		if (!this.length) {
			return this;
		}

		var $wrapper = $('<div class="s-notify">').css({
			position: 'fixed',
			display: 'none',
			right: '1.7em',
			top: '3.3em',
			padding: '1em',
			'background-color': 'white',
			'box-shadow': '0px 0px 6px 0px rgba(0,0,0,0.1)',
			'z-index': 99999
		});

		$wrapper.wrapInner(this);
		$wrapper.appendTo('body');

		if (options.icon) {
			$('<i/>').addClass(options.icon).appendTo($wrapper);
		}

		if (options.content) {
			$('<div class="notify-content"></div>').css('display', 'inline-block').wrapInner(options.content).appendTo($wrapper);
		}

		setTimeout(function() {
			$wrapper.fadeIn();
			if (options.delay) {
				setTimeout(function() {
					$wrapper.fadeOut(function() {
						$wrapper.remove();
					});
				}, options.delay);
			}
		}, 200);

		return $.extend($wrapper, {
			close: function(timeout) {
				setTimeout(function() {
					$wrapper.fadeOut(function() {
						$wrapper.remove();
					});
				}, timeout || '0');
			},
			update: function(content, icon) {
				this.find('.notify-content').empty().append(content);
				if (icon) {
					this.find('i').removeClass().addClass(icon);
				}
				return this;
			}
		});
	};

})(jQuery);
