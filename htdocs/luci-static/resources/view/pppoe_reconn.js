'use strict';
'import ui';
'import uci';
'import view';
'import fs';
'import poll';

return view.extend({
    load: function() {
        return uci.load('pppoe_reconn');
    },

    render: function(data) {
        let m, s, o;

        m = new form.Map('pppoe_reconn', _('PPPoE 重拨助手'), _('手动断开 PPPoE 并延迟连接，用于更换动态 IP。'));

        s = m.section(form.TypedSection, 'main', _('设置'));
        s.anonymous = true;

        o = s.option(form.Value, 'delay', _('断开等待时长 (秒)'), _('建议设置 10 秒以上，确保运营商机房识别下线。'));
        o.datatype = 'uinteger';
        o.default = '10';

        // 按钮
        s = m.section(form.Section, 'actions', _('手动操作'));
        s.render = function() {
            return E('div', { 'class': 'cbi-section' }, [
                E('button', {
                    'class': 'cbi-button cbi-button-apply',
                    'click': ui.createHandlerFn(this, function() {
                        return fs.exec('/usr/bin/pppoe_reconn.sh').then(function() {
                            ui.addNotification(null, E('p', _('指令已发送！请观察下方日志。')), 'info');
                        });
                    })
                }, [ _('立即断开并重拨') ])
            ]);
        };

        // 日志展示
        s = m.section(form.Section, 'log', _('运行记录'));
        s.render = function() {
            let log_area = E('textarea', {
                'id': 'log_content',
                'style': 'width:100%; height:300px; font-family:monospace; font-size:12px;',
                'readonly': true
            }, '正在载入日志...');

            // 每 3 秒自动刷新一次日志
            poll.add(function() {
                return fs.read('/etc/pppoe_ip_history.log').then(function(res) {
                    log_area.value = res || '暂无日志记录';
                    log_area.scrollTop = log_area.scrollHeight;
                });
            }, 3);

            return E('div', { 'class': 'cbi-section' }, [ log_area ]);
        };

        return m.render();
    }
});