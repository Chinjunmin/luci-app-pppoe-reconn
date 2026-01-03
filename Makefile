include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-pppoe-reconn
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for PPPoE Manual Reconnect
  DEPENDS:=+luci-base
  PKGARCH:=all
endef

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	# 安装二进制脚本
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./root/usr/bin/pppoe_reconn.sh $(1)/usr/bin/
	
	# 安装配置文件
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/pppoe_reconn $(1)/etc/config/
	
	# 安装初始化脚本
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) ./root/etc/uci-defaults/99-pppoe-reconn $(1)/etc/uci-defaults/
	
	# 安装菜单定义、权限 ACL 和前端 JS 视图
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(CP) ./root/usr/share/luci/menu.d/*.json $(1)/usr/share/luci/menu.d/
	
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(CP) ./root/usr/lib/lua/luci/controller/*.lua $(1)/usr/lib/lua/luci/controller/
	
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(CP) ./root/usr/share/rpcd/acl.d/*.json $(1)/usr/share/rpcd/acl.d/

	$(INSTALL_DIR) $(1)/www/luci-static/resources/view
	$(CP) ./htdocs/luci-static/resources/view/*.js $(1)/www/luci-static/resources/view/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))