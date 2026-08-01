<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/dashboard/admin', 'dashboard/admin')->name('dashboard.admin');
Route::inertia('/dashboard/enseignant', 'dashboard/enseignant')->name('dashboard.enseignant');
Route::inertia('/dashboard/direction', 'dashboard/direction')->name('dashboard.direction');
Route::inertia('/dashboard/parent', 'dashboard/parent')->name('dashboard.parent');
Route::inertia('/dashboard/direction/statistiques', 'dashboard/statistiques')->name('dashboard.direction.statistiques');
Route::inertia('/dashboard/admin/classes', 'admin/classes/index')->name('admin.classes');
Route::inertia('/dashboard/admin/classes/create', 'admin/classes/create')->name('admin.classes.create');
Route::inertia('/dashboard/admin/classes/{classe}', 'admin/classes/edit')->name('admin.classes.edit');
Route::inertia('/dashboard/admin/matieres', 'admin/matieres/index')->name('admin.matieres');
Route::inertia('/dashboard/admin/matieres/create', 'admin/matieres/create')->name('admin.matieres.create');
Route::inertia('/dashboard/admin/matieres/{matiere}', 'admin/matieres/edit')->name('admin.matieres.edit');
Route::inertia('/dashboard/admin/eleves', 'admin/eleves/index')->name('admin.eleves');
Route::inertia('/dashboard/admin/eleves/create', 'admin/eleves/create')->name('admin.eleves.create');
Route::inertia('/dashboard/admin/eleves/{eleve}', 'admin/eleves/edit')->name('admin.eleves.edit');
Route::inertia('/admin/users', 'admin/users/index')->name('admin.users.index');
Route::inertia('/admin/users/create', 'admin/users/create')->name('admin.users.create');
Route::inertia('/admin/users/{user}', 'admin/users/edit')->name('admin.users.edit');
