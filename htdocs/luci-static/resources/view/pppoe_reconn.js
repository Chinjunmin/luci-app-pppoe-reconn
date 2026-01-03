'use strict';

return L.view.extend({
    load: function() {
        return L.uci.load('pppoe_reconn');
    },

    render: function(data) {
        var delay = L.uci.get('pppoe_reconn', 'main', 'delay') || '10';

        // 加载日志
        L.fs.read('/etc/pppoe_ip_history.log').then(function(res) {
            var logEl = document.getElementById('log_content');
            if (logEl) logEl.value = res || '暂无日志记录';
        }).catch(function() {
            var logEl = document.getElementById('log_content');
            if (logEl) logEl.value = '暂无日志记录';
        });

        // 每 3 秒刷新日志
        if (!this.logInterval) {
            this.logInterval = setInterval(function() {
                L.fs.read('/etc/pppoe_ip_history.log').then(function(res) {
                    var logEl = document.getElementById('log_content');
                    if (logEl) {
                        logEl.value = res || '暂无日志记录';
                        logEl.scrollTop = logEl.scrollHeight;
                    }
                }).catch(function() {
                    var logEl = document.getElementById('log_content');
                    if (logEl) logEl.value = '暂无日志记录';
                });
            }, 3000);
        }

        return E('div', { 'class': 'cbi-map' }, [
            E('h2', {}, 'PPPoE 重拨助手'),
            E('div', { 'class': 'cbi-map-descr' }, '手动断开 PPPoE 并延迟连接，用于更换动态 IP。'),

            // 设置部分
            E('fieldset', { 'class': 'cbi-section' }, [
                E('legend', {}, '设置'),
                E('div', { 'class': 'cbi-value' }, [
                    E('label', { 'class': 'cbi-value-title' }, '断开等待时长 (秒)'),
                    E('div', { 'class': 'cbi-value-field' }, [
                        E('input', {
                            'type': 'text',
                            'class': 'cbi-input-text',
                            'value': delay,
                            'id': 'delay_input'
                        }),
                        E('div', { 'class': 'cbi-value-description' }, '建议设置 180 秒以上，确保运营商机房识别下线。')
                    ])
                ]),
                E('div', { 'class': 'cbi-section-actions' }, [
                    E('input', {
                        'type': 'button',
                        'class': 'cbi-button cbi-button-save',
                        'value': '保存设置',
                        'click': L.ui.createHandlerFn(this, function() {
                            var new_delay = document.getElementById('delay_input').value;
                            L.uci.set('pppoe_reconn', 'main', 'delay', new_delay);
                            L.uci.save().then(function() {
                                L.ui.addNotification(null, '设置已保存', 'info');
                            });
                        })
                    })
                ])
            ]),

            // 手动操作部分
            E('fieldset', { 'class': 'cbi-section' }, [
                E('legend', {}, '手动操作'),
                E('div', { 'class': 'cbi-value' }, [
                    E('input', {
                        'type': 'button',
                        'class': 'cbi-button cbi-button-apply',
                        'value': '立即断开并重拨',
                        'click': L.ui.createHandlerFn(this, function() {
                            L.fs.exec('/usr/bin/pppoe_reconn.sh').then(function() {
                                L.ui.addNotification(null, '指令已发送！请观察下方日志。', 'info');
                            });
                        })
                    })
                ])
            ]),

            // 日志部分
            E('fieldset', { 'class': 'cbi-section' }, [
                E('legend', {}, '运行记录'),
                E('div', { 'class': 'cbi-value' }, [
                    E('textarea', {
                        'id': 'log_content',
                        'style': 'width:100%; height:300px; font-family:monospace; font-size:12px;',
                        'readonly': true
                    }, '正在载入日志...')
                ])
            ])
        ]);
    }
});