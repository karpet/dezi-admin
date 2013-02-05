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
Ext.ns('Dezi.Admin.Index');

Ext.define('Dezi.Admin.Stats.Model', {
    extend: 'Ext.data.Model',
    fields: [],  // in http response
    idProperty: 'id'
});

Ext.define('Dezi.Admin.Index.Model', {
    extend: 'Ext.data.Model',
    fields: [],  // in http response
    idProperty: 'path'
});

// json viewer based on http://jsonviewer.stack.hu/jsonviewer.js

Dezi.Admin.json2leaf = function (json) {
    var ret = [];
    for (var i in json) {
        if (json.hasOwnProperty(i)) {
            if (json[i] === null) {
                ret.push({text: i + ' : null', leaf: true});
            } 
            else if (typeof json[i] === 'string') {
                ret.push({text: i + ' : "' + json[i] + '"', leaf: true});
            } 
            else if (typeof json[i] === 'number') {
                ret.push({text: i + ' : ' + json[i], leaf: true});
            } 
            else if (typeof json[i] === 'boolean') {
                ret.push({text: i + ' : ' + (json[i] ? 'true' : 'false'), leaf: true});
            } 
            else if (typeof json[i] === 'object') {
                ret.push({text: i, children: Dezi.Admin.json2leaf(json[i])});
            } 
            else if (typeof json[i] === 'function') {
                ret.push({text: i + ' : function', leaf: true});
            }
        }
    }
    return ret;
};

Dezi.Admin.StoreToTree = function(json) {
    // convert json from store syntax to tree syntax
    var treeData = [];
    Ext.iterate(json.results, function(invindex, idx, array) {
        //console.log(invindex);
        var thisIdx = {
            text: invindex.path,
            expanded: true,
            children: Dezi.Admin.json2leaf(invindex.config)
        };
        
        treeData.push(thisIdx);
    });

    return treeData;
};

Dezi.Admin.Index.createViewer = function(json) {

    var treeData = Dezi.Admin.StoreToTree(json);

    var propertyGrid = Ext.create('Ext.grid.property.Grid', {
        region: 'east',
        width: 300,
        border: true,
        //split: true,
        listeners: {
            beforeedit: function () {
                return false;
            },
            render : function() {
                console.log('propertygrid render');
            }
        },
        source: {},
        selModel: {
            mode: 'SIMPLE',
        }
    });
        
    //console.log('defined propertygrid');
    
    var treeStore = Ext.create('Ext.data.TreeStore', {
        root: {
            text: 'Indexes',
            expanded: true,
            children: treeData
        }
    });
    
    var gridbuilder = function(node) {
        //console.log(node);
        if (node.isLeaf()) {
            node = node.parentNode;
        }
        // occur, that are not yet particularly
        if (!node.childNodes.length) {
            node.expand(false, false);
            node.collapse(false, false);
        }
        var source = {};
        for (var i = 0; i < node.childNodes.length; i++) {
            //console.log(node.childNodes[i]);
            var t = node.childNodes[i].raw.text.indexOf(':');
            if (t === -1) {
                source[node.childNodes[i].raw.text] = '...';
            } else {
                source[node.childNodes[i].raw.text.substring(0, t)] = node.childNodes[i].raw.text.substring(t + 1);
            }
        }
        propertyGrid.setSource(source);
    };
    
    var tree = Ext.create('Ext.tree.Panel', {
        minWidth: 100,
        region: 'center',
        lines: true, 
        store: treeStore,
        border: true,
        autoScroll: true,
        //trackMouseOver: false,
        listeners: {
            render: function (tree) {
                //console.log('render tree', tree);
                tree.getSelectionModel().on('selectionchange', function (selModel, nodes) {
                    //console.log(selModel,nodes);
                    gridbuilder(nodes[0]);
                });
            },
            contextmenu: function (node, e) {
                console.log('contextmenu');
                var menu = new Ext.menu.Menu({
                    items: [{
                        text: 'Expand',
                        handler: function () {
                            node.expand();
                        }
                    }, {
                        text: 'Expand all',
                        handler: function () {
                            node.expand(true);
                        }
                    }, '-', {
                        text: 'Collapse',
                        handler: function () {
                            node.collapse();
                        }
                    }, {
                        text: 'Collapse all',
                        handler: function () {
                            node.collapse(true);
                        }
                    }]
                });
                menu.showAt(e.getXY());
            }
        }
    });
    
    var panel = Ext.create('Ext.panel.Panel', {
        layout: 'border',
        height: 400,
        border: false,
        items: [tree, propertyGrid]
    
    });
     
    //return tree; 
    return panel;

}
    
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
            items: [
            {
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
                items: [
                {
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
                    autoScroll: true,
                    listeners: {
                        activate: function() {
                            //console.log('indexes', this);
                            var tab = this;
                            Ext.Ajax.request({
                                url: DEZI_ADMIN_BASE_URL + '/api/indexes',
                                success: function(response) {
                                    var json = Ext.decode(response.responseText);
                                    var panel = Dezi.Admin.Index.createViewer(json);
                                    tab.removeAll();
                                    tab.add(panel);
                                }
                            });
                        }
                    
                    }
                }
                ]
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
    
};

// render whole page
Ext.onReady(function () {

    if (Ext.getBody().id === "ui") {
        Dezi.Admin.UI();
    }

});
