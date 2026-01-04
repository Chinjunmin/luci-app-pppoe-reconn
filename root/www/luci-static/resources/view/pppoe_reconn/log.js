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
var callClearLog = rpc.declare({
    object: 'pppoe_reconn',
    method: 'clear_log',
    params: [],
    expect: {}
});


return view.extend({
    load: function () {
        return uci.load('pppoe_reconn');
    },

    render: function () {
        var delay = uci.get('pppoe_reconn', 'main', 'delay') || '10';
        var logPath = '/tmp/pppoe_reconn.log';
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
                E('div', { 'class': 'cbi-value' }, [
                    E('input', {
                        'type': 'button',
                        'class': 'cbi-button cbi-button-apply',
                        'value': '立即断开并重拨',
                        'click': function () {
                            ui.addNotification(null, '正在发送重拨指令…', 'info');

                            callReconnect().then(function (res) {
                                if (res && res.status === 'started') {
                                    ui.addNotification(null, '重拨脚本已执行', 'info');
                                } else if(res && res.status === 'busy') {
                                    ui.addNotification(null, '已有重拨任务在运行中，请稍后再试', 'warning');
                                }
                                else {
                                    ui.addNotification(null,'执行失败：' + (res && res.message ? res.message : '未知错误'),'danger');
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

                E('div', { 'style': 'margin-bottom:8px;' }, [
                    E('button', {
                        'class': 'cbi-button cbi-button-remove',
                        'click': function () {
                            callClearLog().then(function (res) {
                                if (res && res.status === 'cleared') {
                                    document.getElementById('log_content').value = '';
                                    ui.addNotification(null, '日志已清空', 'info');
                                } else {
                                    ui.addNotification(null, '清空日志失败', 'danger');
                                }
                            }).catch(function (err) {
                                ui.addNotification(null, 'RPC 调用失败：' + err, 'danger');
                            });
                        }
                    }, _('清空日志'))
                ]),

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
