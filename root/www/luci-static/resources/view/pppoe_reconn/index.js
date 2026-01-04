'use strict';
'require view';
'require ui';

return view.extend({
    load: function () {
        // 进入父页面时，自动跳转到 log 选项卡
        ui.redirect(L.url('admin/services/pppoe_reconn/log'));
    },

    render: function () {
        return E('div');
    }
});
