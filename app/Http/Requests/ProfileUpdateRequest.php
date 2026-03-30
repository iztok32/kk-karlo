<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'gsm_number' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'max:2048'], // max 2MB

            // Profile fields - General information
            'address' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'regex:/^\d{4}$/', 'max:4'],
            'city' => ['nullable', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],

            // Personal information
            'username' => [
                'nullable',
                'string',
                'regex:/^[a-zA-Z0-9_]+$/',
                'max:50',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            // Phone numbers
            'home_phone' => ['nullable', 'string', 'max:20'],
            'work_phone' => ['nullable', 'string', 'max:20'],
            'fax' => ['nullable', 'string', 'max:20'],

            // Visibility switches
            'gsm_number_public' => ['boolean'],
            'home_phone_public' => ['boolean'],
            'work_phone_public' => ['boolean'],
            'fax_public' => ['boolean'],

            // Membership information
            'horseman_type_id' => ['nullable', 'exists:horseman_type,id'],
            'is_member' => ['boolean'],
            'membership_paid' => ['boolean'],
            'notify_free_slots' => ['boolean'],
        ];
    }
}
