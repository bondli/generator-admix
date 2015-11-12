/**
 * @ngdoc filter
 * @name <%= appname %>.mod:apimap
 * @function
 * @description
 * # apimap
 * Mod in the <%= appname %>.
 */
define(function(require) {
    return {
        listApi : {
            api  : 'mtop.citylife.eticket.list.get',
            v    : '1.0',
            data : {}
        },
        detailApi : {
            api  : 'mtop.citylife.eticket.detail.get',
            v    : '1.0',
            data : {}
        },
        deleteApi : {
            api  : 'mtop.citylife.eticket.single.del',
            v    : '1.0',
            data : {}
        },
        updateApi : {
            api  : 'mtop.citylife.eticket.detail.update',
            v    : '1.0',
            data : {}
        }
	};

});
