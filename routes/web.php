<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/dashboard/admin', 'dashboard/admin')->name('dashboard.admin');
Route::inertia('/dashboard/enseignant', 'dashboard/enseignant')->name('dashboard.enseignant');
Route::inertia('/admin/users/create', 'admin/users/create')->name('admin.users.create');
