<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Coupon history and balances for the current user
        $coupons = \App\Models\Coupon::with(['couponType:id,name', 'reservation.appointment:id,name'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $couponTypes = \App\Models\CouponType::orderBy('name')->get(['id', 'name']);

        $couponBalances = $couponTypes->map(function ($type) use ($coupons) {
            $balance = $coupons->where('coupon_type_id', $type->id)->sum(function ($c) {
                return $c->transaction_type === 'purchase' ? $c->quantity : -$c->quantity;
            });
            return ['id' => $type->id, 'name' => $type->name, 'balance' => (int) $balance];
        })->values();

        $couponHistory = $coupons->map(function ($c) {
            return [
                'id'               => $c->id,
                'coupon_type'      => $c->couponType?->name,
                'quantity'         => $c->transaction_type === 'purchase' ? $c->quantity : -$c->quantity,
                'transaction_type' => $c->transaction_type,
                'price_paid'       => $c->price_paid,
                'appointment'      => $c->reservation?->appointment?->name,
                'created_at'       => $c->created_at,
            ];
        })->values();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => session('status'),
            'permissions'     => [
                'canView'   => $user->hasPermission('profile.view'),
                'canEdit'   => $user->hasPermission('profile.edit'),
                'canDelete' => $user->hasPermission('profile.delete'),
            ],
            'horsemanTypes'   => \App\Models\HorsemanType::where('is_active', true)
                ->orderBy('display_order')
                ->get(['id', 'name']),
            'couponBalances'  => $couponBalances,
            'couponHistory'   => $couponHistory,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Eager-load roles with permissions to ensure hasPermission() works correctly
        $request->user()->load('roles.permissions');

        // Check if user has permission to edit profile
        if (!$request->user()->hasPermission('profile.edit')) {
            abort(403, 'You do not have permission to edit your profile.');
        }

        $user = $request->user();
        $user->fill($request->validated());

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        // Eager-load roles with permissions to ensure hasPermission() works correctly
        $request->user()->load('roles.permissions');

        // Check if user has permission to edit profile
        if (!$request->user()->hasPermission('profile.edit')) {
            abort(403, 'You do not have permission to edit your profile.');
        }

        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
            $user->save();
        }

        return Redirect::back()->with('success', 'Avatar updated successfully.');
    }

    /**
     * Remove the user's avatar.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        // Eager-load roles with permissions
        $request->user()->load('roles.permissions');

        if (!$request->user()->hasPermission('profile.edit')) {
            abort(403, 'You do not have permission to edit your profile.');
        }

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
        }

        return Redirect::back()->with('success', 'Avatar removed successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Eager-load roles with permissions to ensure hasPermission() works correctly
        $request->user()->load('roles.permissions');

        // Check if user has permission to delete account
        if (!$request->user()->hasPermission('profile.delete')) {
            abort(403, 'You do not have permission to delete your account.');
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
