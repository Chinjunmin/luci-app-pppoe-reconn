'use strict';
'require view';
'require rpc';
'require uci';
'require fs';
'require ui';

var callReconnect = rpc.declare({
    object: 'pppoe_reconn',
    method: 'reconnect',
    params: [],
    expect: {}
});

return view.extend({
    load: function () {
        return uci.load('pppoe_reconn');
    },

    render: function () {
        var delay = uci.get('pppoe_reconn', 'main', 'delay') || '10';
        var logPath = '/tmp/pppoe_ip_history.log';
        var self = this;

        function loadLog() {
            fs.read(logPath).then(function (res) {
                var logEl = document.getElementById('log_content');
                if (logEl) {
                    logEl.value = res || '暂无日志记录';
                    logEl.scrollTop = logEl.scrollHeight;
                }
            }).catch(function () {
                var logEl = document.getElementById('log_content');
                if (logEl) logEl.value = '暂无日志记录';
            });
        }

        loadLog();

        if (!self.logInterval) {
            self.logInterval = setInterval(loadLog, 3000);
        }

        return E('div', { 'class': 'cbi-map' }, [
            E('h2', {}, 'PPPoE 重拨助手'),
            E('div', { 'class': 'cbi-map-descr' },
                '手动断开 PPPoE 并延迟连接，用于更换动态 IP。'
            ),

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
                        E('div', { 'class': 'cbi-value-description' },
                            '建议设置 180 秒以上，确保运营商机房识别下线。'
                        )
                    ])
                ]),
                E('div', { 'class': 'cbi-section-actions' }, [
                    E('input', {
                        'type': 'button',
                        'class': 'cbi-button cbi-button-save',
                        'value': '保存设置',
                        'click': function () {
                            var newDelay = document.getElementById('delay_input').value;
                            uci.set('pppoe_reconn', 'main', 'delay', newDelay);
                            uci.save().then(function () {
                                ui.addNotification(null, '设置已保存', 'info');
                            });
                        }
                    })
                ])
            ]),

            E('fieldset', { 'class': 'cbi-section' }, [
                E('legend', {}, '手动操作'),
                E('div', { 'class': 'cbi-value' }, [
                    E('input', {
                        'type': 'button',
                        'class': 'cbi-button cbi-button-apply',
                        'value': '立即断开并重拨',
                        'click': function () {
                            ui.addNotification(null, '正在发送重拨指令…', 'info');

                            callReconnect().then(function (res) {
                                if (res && res.success) {
                                    ui.addNotification(null, '重拨脚本已执行', 'info');
                                } else {
                                    ui.addNotification(
                                        null,
                                        '执行失败：' + (res && res.message ? res.message : '未知错误'),
                                        'danger'
                                    );
                                }
                            }).catch(function (err) {
                                ui.addNotification(
                                    null,
                                    'RPC 调用失败：' + err,
                                    'danger'
                                );
                            });
                        }
                    })
                ])
            ]),

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
    },

    unload: function () {
        if (this.logInterval) {
            clearInterval(this.logInterval);
            this.logInterval = null;
        }
    }
});
