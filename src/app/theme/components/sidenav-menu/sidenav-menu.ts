import { SidenavMenu } from './sidenav-menu.model';

export const sidenavMenuItems = [
    new SidenavMenu (1, 'NAV.HOME', '/', null, null, false, 0),
    new SidenavMenu (2, 'Mode - Beauté', '/products/mode', null, null, true, 0),
    new SidenavMenu (3, 'Santé - Bien être', '/products/bijoux', null, null, false, 0),
    new SidenavMenu (4, 'Electroménagers', '/products/electronics', null, null, false, 0),
    new SidenavMenu (5, 'Multimedia', '/products/multimedia', null, null, false, 0),
    new SidenavMenu (6, 'Maison - Bureau', '/products/vehicules', null, null, false, 0),
    new SidenavMenu (7, 'Matériels & Outils', '/products/sports', null, null, false, 0),
    new SidenavMenu (8, 'Auto - Moto', '/products/autres', null, null, false, 0),
    new SidenavMenu (9, 'Autres', '/products/autres', null, null, false, 0),
    // new SidenavMenu (60, 'NAV.PAGES', null, null, null, true, 0),
    new SidenavMenu (61, 'NAV.SHOP', null, null, null, true, 60),
    new SidenavMenu (62, 'NAV.ALL_PRODUCTS', '/products', null, null, false, 61),
    new SidenavMenu (63, 'NAV.PRODUCT_DETAIL', '/products/2/PC All-in-One', null, null, false, 61),
    // new SidenavMenu (64, 'NAV.CART', '/cart', null, null, false, 61),
    new SidenavMenu (65, 'NAV.CHECKOUT', '/checkout', null, null, false, 61),
    new SidenavMenu (70, 'LOGIN', '/sign-in', null, null, false, 60),
    new SidenavMenu (71, 'NAV.404_PAGE', '/404', null, null, false, 60),
    new SidenavMenu (72, 'NAV.LANDING', '/landing', null, null, false, 60),
    new SidenavMenu (80, 'NAV.CONTACT', '/contact', null, null, false, 0),
    
    // 
    new SidenavMenu (80, 'NAV.CONTACT', '/contact', null, null, false, 0),
    new SidenavMenu (201,'Habits Femme','/products/women-cloth',null,null, false,2),
    new SidenavMenu (202,'Lingerie','/products/lingerie',null,null,false,2),
    new SidenavMenu (203,'Parfum & Déodorant','/products/perfumes',null,null,false,2),

    new SidenavMenu(204,'Cheveux - Coiffure','/products/hair',null, null, false,2),
    new SidenavMenu(205,'Sacs - Valises','/products/bags',null, null, false,2),
    new SidenavMenu(206,'Bijoux - Montres & Bracelets','/products/jewellery',null, null, false,2),
    new SidenavMenu(207,'Chaussures','/products/shoes',null, null, false,2),
    new SidenavMenu(208,'Tissus - Wax - Bazin','/products/tissu-wax',null, null, false,2),
    new SidenavMenu(209,'Habits Homme','/products/men-cloth',null, null, false,2),
    // 
    // new SidenavMenu (90, 'NAV.ADMIN', '/admin', null, null, false, 0),
    // new SidenavMenu (140, 'Level 1', null, null, null, true, 0),
    // new SidenavMenu (141, 'Level 2', null, null, null, true, 140),
    // new SidenavMenu (142, 'Level 3', null, null, null, true, 141),
    // new SidenavMenu (143, 'Level 4', null, null, null, true, 142),
    // new SidenavMenu (144, 'Level 5', null, 'http://themeseason.com', null, false, 143),
    // new SidenavMenu (200, 'NAV.EXTERNAL_LINK', null, 'http://themeseason.com', '_blank', false, 0)
]
