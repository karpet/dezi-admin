/* Dezi::Admin::UI JavaScript */


Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', ExtJS_URL + '/examples/ux/');
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.PagingScroller',
    'Ext.ux.form.SearchField'
]);

// create our namespaces
Ext.ns('Dezi.Admin');
Ext.ns('Dezi.Admin.Stats');

Dezi.Admin.Stats.onStoreSizeChange = function () {
    Dezi.Admin.Stats.grid.down('#status').update({count: Dezi.Admin.Stats.store.getTotalCount()});
};

Dezi.Admin.Stats.List = function() {
    Ext.define('DeziStatsList', {
        extend: 'Ext.data.Model',
        fields: [],  // in http response
        idProperty: 'id'
    });
    
    //console.log('model ok');

    // create the Data Store
    Dezi.Admin.Stats.store = Ext.create('Ext.data.Store', {
        //id: 'store',
        model: 'DeziStatsList',
        
        // allow the grid to interact with the paging scroller by buffering
        buffered: true,
        
        // server-side sorting
        remoteSort: true,
        
        // sql limit
        pageSize: 50,

        // how many rows to keep in buffer
        leadingBufferZone: 1000,
        proxy: {
            // load using script tags for cross domain, if the data in on the same domain as
            // this page, an HttpProxy would be better
            type: 'ajax',
            
            url: DEZI_ADMIN_BASE_URL + '/api/stats',
            
            reader: {
                type: 'json'
            },
            
            
            // sends single sort as multi parameter
            simpleSortMode: true,
            
            simpleGroupMode: false,
            
            // Parameter name to send filtering information in
            filterParam: 'q'
            
        },
        listeners: {
            totalcountchange: Dezi.Admin.Stats.onStoreSizeChange
        },
        remoteFilter: true,

        autoLoad: true
    });
    
    //console.log('store ok');

    Dezi.Admin.Stats.grid = Ext.create('Ext.grid.Panel', {
        width: 700,
        height: 500,
        collapsible: true,
        title: 'Dezi Stats',
        store: Dezi.Admin.Stats.store,
        loadMask: true,
        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: [{
                width: 400,
                fieldLabel: 'Search',
                labelWidth: 50,
                xtype: 'searchfield',
                store: Dezi.Admin.Stats.store
            }, '->', {
                xtype: 'component',
                itemId: 'status',
                tpl: 'Matching records: {count}',
                style: 'margin-right:5px'
            }]
        }],
        selModel: {
            pruneRemoved: false
        },
        multiSelect: false,
        viewConfig: {
            trackOver: false
        },
        
        // grid columns
        columns:[{
            xtype: 'rownumberer',
            width: 50,
            sortable: false
        },
        {
            text: "Path",
            dataIndex: 'path',
            flex: 1,
            sortable: true
        },
        {
            text: "Remote User",
            dataIndex: 'remote_user',
            width: 100,
            sortable: true
        },
        {
            text: "Query",
            dataIndex: 'q',
            flex: 1,
            sortable: true
        },
        {
            text: "Total",
            dataIndex: 'total',
            width: 50,
            sortable: true
        },
        {
            text: "When",
            dataIndex: 'tstamp',
            width: 120,
            renderer: Ext.util.Format.dateRenderer('n/j/Y g:i A'),
            sortable: true
        }],
        renderTo: Ext.getBody()
    });
    
    //console.log('grid ok');
};

// load 
Ext.onReady(function() {
    //console.log('ready');
    Dezi.Admin.Stats.List();

});
