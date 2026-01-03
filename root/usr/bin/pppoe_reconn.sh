#!/bin/sh

# 从 UCI 获取配置，如果为空则设为默认值
INTERFACE=$(uci get pppoe_reconn.main.interface 2>/dev/null || echo "wan")
DELAY=$(uci get pppoe_reconn.main.delay 2>/dev/null || echo "180")
LOG_FILE="/etc/pppoe_ip_history.log"

# 获取旧 IP
OLD_IP=$(ifstatus $INTERFACE | jsonfilter -e '@["ipv4-address"][0].address' 2>/dev/null)
[ -z "$OLD_IP" ] && OLD_IP="未连接"

echo "$(date '+%Y-%m-%d %H:%M:%S') - [开始] 断开接口 $INTERFACE，等待 $DELAY 秒..." >> $LOG_FILE

# 断开拨号
ifdown $INTERFACE
sleep "$DELAY"

# 重新拨号
ifup $INTERFACE
echo "$(date '+%Y-%m-%d %H:%M:%S') - [进行] 已发送拨号指令，正在获取新 IP..." >> $LOG_FILE

# 等待拨号完成
sleep 15
NEW_IP=$(ifstatus $INTERFACE | jsonfilter -e '@["ipv4-address"][0].address' 2>/dev/null)
[ -z "$NEW_IP" ] && NEW_IP="拨号中或失败"

echo "$(date '+%Y-%m-%d %H:%M:%S') - [结果] 旧 IP: $OLD_IP | 新 IP: $NEW_IP" >> $LOG_FILE
echo "------------------------------------------------------" >> $LOG_FILE