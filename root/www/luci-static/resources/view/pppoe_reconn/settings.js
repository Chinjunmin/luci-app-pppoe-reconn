'use strict';
'require view';
'require form';

return view.extend({
    render: function () {
        var m, s, o;

        m = new form.Map('pppoe_reconn', _('PPPoE 重拨设置'),
            _('配置 PPPoE 断开等待时间,保存后自动生效.')
        );

        s = m.section(form.TypedSection, 'main', '');
        s.anonymous = true;

        o = s.option(form.Value, 'delay', _('断开等待时长（秒）'));
        o.datatype = 'uinteger';
        o.default = '10';
        o.placeholder = '10';
        o.description = _('默认设置10秒,如不能正确切换IP,请增加时长以确保运营商机房识别下线.');

        return m.render();
    }
});
