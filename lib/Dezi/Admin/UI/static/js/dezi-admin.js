/* Dezi::Admin::UI JavaScript */


Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath({
    'Ext.ux': ExtJS_URL + '/examples/ux/',
    'Ext.app': ExtJS_URL + '/examples/portal/classes/'
});
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.grid.PagingScroller',
    'Ext.ux.form.SearchField',
    'Ext.Viewport',
    //'Ext.data.JsonStore',
    'Ext.tip.QuickTipManager',
    'Ext.tab.Panel',
    'Ext.ux.GroupTabPanel',
    'Ext.app.PortalColumn',
    'Ext.app.PortalDropZone',
    'Ext.app.Portlet',
    'Ext.app.GridPortlet',
    'Ext.app.PortalPanel'
]);

// create our namespaces
Ext.ns('Dezi.Admin');
Ext.ns('Dezi.Admin.Stats');

Ext.define('Dezi.Admin.Stats.Model', {
    extend: 'Ext.data.Model',
    fields: [],  // in http response
    idProperty: 'id'
});
    
Ext.define('Dezi.Admin.Stats.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.dezi-admin-stats-list',
    
    onStoreSizeChange: function () {
        //console.log(this);
        Ext.getCmp('dezi-admin-stats-list').down('#status').update({count: this.getTotalCount()});
    },
    
    initComponent: function() {

        // create the Data Store
        Dezi.Admin.Stats.store = Ext.create('Ext.data.Store', {
            
            model: 'Dezi.Admin.Stats.Model',
        
            // allow the grid to interact with the paging scroller by buffering
            buffered: true,
        
            // server-side sorting
            remoteSort: true,
        
            // sql limit
            pageSize: 50,

            // how many rows to keep in buffer
            leadingBufferZone: 1000,
            proxy: {
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
                totalcountchange: this.onStoreSizeChange
            },
            remoteFilter: true,

            autoLoad: true
        });
    
        //console.log('store ok');

        Ext.apply(this, {
           //width: 700,
           //height: 500,
           collapsible: false,
           title: 'Stats',
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
               text: "Build time",
               dataIndex: 'build_time',
               width: 60,
               sortable: true
           },
           {
               text: "Search time",
               dataIndex: 'search_time',
               width: 60,
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
           }]
        });
     
        this.callParent(arguments);  
    }
    
});

Dezi.Admin.UI = function() {

    Ext.tip.QuickTipManager.init();

    // create some portlet tools using built in Ext tool ids
    var tools = [{
        type: 'gear',
        handler: function () {
            Ext.Msg.alert('Message', 'The Settings tool was clicked.');
        }
    }, {
        type: 'close',
        handler: function (e, target, panel) {
            panel.ownerCt.remove(panel, true);
        }
    }];

    Ext.create('Ext.Viewport', {
        layout: 'fit',
        items: [{
            xtype: 'grouptabpanel',
            activeGroup: 0,
            items: [{
                mainItem: 1,
                items: [{
                    title: 'Stats',
                    iconCls: 'x-icon-stats',
                    tabTip: 'Stats tabtip',
                    //border: false,
                    id: 'dezi-admin-stats-list',
                    xtype: 'dezi-admin-stats-list',
                    margin: '10',
                    height: null
                }, 
                {
                    //xtype: 'portalpanel',
                    title: 'Dashboard',
                    tabTip: 'Dashboard tabtip',
                    border: false,
                    items: [{
                        flex: 1,
                        items: [{
                            title: 'Dezi Server Administration',
                            border: false,
                            html: '<div class="portlet-content">' + 'some content' + '</div>'
                        }
                        // TODO graphic of search times, etc
                        ]
                    }]
                }
                /*, 
                {
                    title: 'Subscriptions',
                    iconCls: 'x-icon-subscriptions',
                    tabTip: 'Subscriptions tabtip',
                    style: 'padding: 10px;',
                    border: false,
                    layout: 'fit',
                    items: [{
                        xtype: 'tabpanel',
                        activeTab: 1,
                        items: [{
                            title: 'Nested Tabs',
                            html: 'nested tab content'
                        }]
                    }]
                }, {
                    title: 'Users',
                    iconCls: 'x-icon-users',
                    tabTip: 'Users tabtip',
                    style: 'padding: 10px;',
                    html: 'user content'
                }
                */
                ]
            }, 
            {
                expanded: true,
                items: [{
                    title: 'Configuration',
                    iconCls: 'x-icon-configuration',
                    tabTip: 'Configuration tabtip',
                    style: 'padding: 10px;',
                    border: false,
                    html: 'configuration content'
                }, 
                {
                    title: 'Indexes',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Indexes tabtip',
                    style: 'padding: 10px;',
                    border: false,
                    items: [
                        {
                            border: false,
                            html: '<h1>TODO</h1>'
                        }    
                    ]
                }]
            }, 
            {
                expanded: false,
                items: {
                    title: 'TODO ',
                    bodyPadding: 10,
                    html: '<h1>TODO</h1>',
                    border: false
                }
            }]
        }]
    });
    
    Dezi.Admin.Stats.List();
};

// render whole page
Ext.onReady(function () {

    if (Ext.getBody().id === "ui") {
        Dezi.Admin.UI();
    }

});
