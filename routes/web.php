<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/admin/users/create', 'admin/users/create')->name('admin.users.create');
