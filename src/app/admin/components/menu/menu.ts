import { Menu } from './menu.model';

export const menuItems = [
    new Menu (10, 'ADMIN_NAV.DASHBOARD', '/admin', null, 'dashboard', null, false, 0),
    new Menu (20, 'ADMIN_NAV.PRODUCTS', null, null, 'grid_on', null, true, 0),
    new Menu (21, 'ADMIN_NAV.CATEGORIES', '/admin/products/categories', null, 'category', null, false, 20),
    // new Menu (25, 'ADMIN_NAV.CATEGORIE_DETAIL', '/admin/products/categorie-detail', null, 'remove_red_eye', null, false, 20),
    new Menu (22, 'ADMIN_NAV.PRODUCT_LIST', '/admin/products/product-list', null, 'list', null, false, 20),
    // new Menu (23, 'ADMIN_NAV.PRODUCT_DETAIL', '/admin/products/product-detail', null, 'remove_red_eye', null, false, 20),
    new Menu (24, 'ADMIN_NAV.ADD_PRODUCT', '/admin/products/add-product', null, 'add_circle_outline', null, false, 20),
    new Menu (40, 'ADMIN_NAV.USERS', '/admin/users', null, 'group_add', null, false, 0),
    new Menu (130, 'ADMIN_NAV.BRAND', '/admin/brand/brand-list', null, 'branding_watermark', null, false, 0),
    new Menu (131, 'ADMIN_NAV.INFLUENCER', '/admin/influencer', null, 'card_giftcard', null, false, 0),
    new Menu (142, 'ADMIN_NAV.CAMPAGNE', '/admin/campagne/campagne-list', null, 'campaign', null, false, 0),
    new Menu (150, 'ADMIN_NAV.CONTACT', '/admin/contact/contact', null, 'contact_mail', null, false, 0),
    new Menu (160, 'ADMIN_NAV.NEWSLETTER', '/admin/newsletter/newsletter', null, 'email', null, false, 0),


    // new Menu (30, 'ADMIN_NAV.SALES', null, null, 'monetization_on', null, true, 0),
    // new Menu (31, 'ADMIN_NAV.ORDERS', '/admin/sales/orders', null, 'list_alt', null, false, 30),
    // new Menu (32, 'ADMIN_NAV.TRANSACTIONS', '/admin/sales/transactions', null, 'local_atm', null, false, 30),
    // new Menu (50, 'ADMIN_NAV.CUSTOMERS', '/admin/customers', null, 'supervisor_account', null, false, 0),
    // new Menu (60, 'ADMIN_NAV.COUPONS', '/admin/coupons', null, 'card_giftcard', null, false, 0),
    // new Menu (70, 'ADMIN_NAV.WITHDRAWAL', '/admin/withdrawal', null, 'credit_card', null, false, 0),
    // new Menu (80, 'ADMIN_NAV.ANALYTICS', '/admin/analytics', null, 'multiline_chart', null, false, 0),
    // new Menu (90, 'ADMIN_NAV.REFUND', '/admin/refund', null, 'restore', null, false, 0),
    // new Menu (100, 'ADMIN_NAV.FOLLOWERS', '/admin/followers', null, 'follow_the_signs', null, false, 0),
    // new Menu (110, 'ADMIN_NAV.SUPPORT', '/admin/support', null, 'support', null, false, 0),
    // new Menu (120, 'ADMIN_NAV.REVIEWS', '/admin/reviews', null, 'insert_comment', null, false, 0),
    // new Menu (130, 'ADMIN_NAV.BRAND', null, null, 'grid_on', null, true, 0),
    // new Menu (131, 'ADMIN_NAV.BRAND_LIST', '/admin/brand/brand-list', null, 'list_alt', null, false, 130),
   // new Menu (132, 'ADMIN_NAV.BRAND_DETAIL', '/admin/brand/brand-detail', null, 'remove_red_eye', null, false, 130),
    // new Menu (140, 'ADMIN_NAV.CAMPAGNE', null, null, 'more_horiz', null, true, 0),
    // new Menu (141, 'ADMIN_NAV.CAMPAGNE_LIST', '/admin/campagne/campagne-list', null, 'list_alt', null, false, 140),
   // new Menu (142, 'ADMIN_NAV.CAMPAGNE_DETAIL', '/admin/campagne/campagne-detail', null, 'remove_red_eye', null, false, 140),

    // new Menu (142, 'Level 3', null, null, 'folder_open', null, true, 141),
    // new Menu (143, 'Level 4', null, null, 'folder_open', null, true, 142),
    // new Menu (144, 'Level 5', null, '/', 'link', null, false, 143),
    // new Menu (200, 'ADMIN_NAV.EXTERNAL_LINK', null, 'http://themeseason.com', 'open_in_new', '_blank', false, 0),

]
