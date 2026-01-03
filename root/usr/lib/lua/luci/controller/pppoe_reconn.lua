module("luci.controller.pppoe_reconn", package.seeall)

function index()
    entry({"admin", "services", "pppoe_reconn"}, view("pppoe_reconn"), _("PPPoE 重拨助手"), 10)
end