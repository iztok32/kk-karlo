<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'gsm_number' => $user->gsm_number,
                    'is_active' => $user->is_active,
                    'roles' => $user->roles->pluck('name'),
                    'created_at' => $user->created_at,
                    'deleted_at' => $user->deleted_at,
                ];
            });

        $roles = Role::orderBy('name')->get();

        return Inertia::render('Core/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'gsm_number' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        // Generate random password - user will reset via email
        $validated['password'] = bcrypt(bin2hex(random_bytes(16)));

        $user = User::create($validated);

        // Attach role if provided
        if (isset($validated['role_id'])) {
            $user->roles()->sync([$validated['role_id']]);
        }

        // Send password reset link
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status == Password::RESET_LINK_SENT) {
            return redirect()->back()->with('success', 'User created successfully. Password reset link sent to user email.');
        }

        return redirect()->back()->with('success', 'User created successfully, but password reset link could not be sent.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'gsm_number' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'gsm_number' => $validated['gsm_number'] ?? $user->gsm_number,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        // Sync role if provided
        if (isset($validated['role_id'])) {
            $user->roles()->sync([$validated['role_id']]);
        } else {
            // If no role provided, remove all roles
            $user->roles()->sync([]);
        }

        return redirect()->back()->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully');
    }

    public function sendPasswordResetLink(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);

        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status == Password::RESET_LINK_SENT) {
            return redirect()->back()->with('success', 'Password reset link sent successfully');
        }

        return redirect()->back()->withErrors(['error' => 'Failed to send password reset link. Please try again.']);
    }
}
