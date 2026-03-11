import { Routes } from '@angular/router';
import { Login } from './modules/auth/pages/login/login';
import { Product } from './modules/products/pages/product/product';
import { ProductEdit } from './modules/products/pages/product-edit/product-edit';
import { AddProduct } from './modules/products/pages/add-product/add-product';
import { Logout } from './modules/auth/pages/logout/logout';
import { Cart } from './modules/products/pages/cart/cart';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'logout',
        component: Logout
    },
    {
        path: 'product',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: Product
            },
            {
                path: 'add',
                component: AddProduct
            },
            {
                path: 'edit/:id',
                component: ProductEdit
            },
            {
                path: 'cart',
                component: Cart
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
