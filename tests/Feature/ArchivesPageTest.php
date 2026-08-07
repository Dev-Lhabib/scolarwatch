<?php

use App\Models\User;

it('renders the unified archives page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/admin/archives')
        ->assertInertia(fn ($page) => $page->component('admin/archives'));
});

it('removes the dedicated user archives route', function () {
    expect(Route::has('admin.users.archives'))->toBeFalse();
});
