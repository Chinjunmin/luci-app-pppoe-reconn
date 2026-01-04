'use strict';
'require view';
'require form';

return view.extend({
    render: function () {
        var m, s, o;

        m = new form.Map(
            'pppoe_reconn',
            _('PPPoE 重拨设置'),
            _('配置 PPPoE 断开等待时间，保存后自动生效。')
        );

        // 固定 section：main
        s = m.section(form.NamedSection, 'main', 'main', '');
        s.addremove = false;

        o = s.option(form.Value, 'delay', _('断开等待时长（秒）'));
        o.datatype = 'uinteger';
        o.default = '10';
        o.placeholder = '10';
        o.description = _('默认 10 秒，如无法成功更换 IP，请增加时长以确保运营商识别下线。');

        return m.render();
    }
});
