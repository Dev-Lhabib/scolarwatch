<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/dashboard/admin', 'dashboard/admin')->name('dashboard.admin');
Route::inertia('/dashboard/enseignant', 'dashboard/enseignant')->name('dashboard.enseignant');
Route::inertia('/dashboard/direction', 'dashboard/direction')->name('dashboard.direction');
Route::inertia('/dashboard/admin/classes', 'admin/classes')->name('admin.classes');
Route::inertia('/dashboard/admin/matieres', 'admin/matieres')->name('admin.matieres');
Route::inertia('/dashboard/admin/eleves', 'admin/eleves')->name('admin.eleves');
Route::inertia('/admin/users/create', 'admin/users/create')->name('admin.users.create');
