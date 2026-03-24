<?php

namespace App\Http\Middleware;

use App\Models\NavigationItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'permissions' => $user->permissions,
                    'config' => $user->config ?? [],
                ]) : null,
            ],
            'locale' => app()->getLocale(),
            'availableLocales' => config('app.available_locales'),
            'availableColorThemes' => config('app.available_color_themes'),
            'navigation' => [
                'configs' => \App\Models\NavigationConfig::all()->pluck('label', 'type'),
                'blocks' => \App\Models\NavigationConfig::orderBy('sort_order')->get()->map(function ($config) use ($user) {
                    return [
                        'type' => $config->type,
                        'group' => $config->group,
                        'label' => $config->label,
                        'items' => NavigationItem::where('type', $config->type)
                            ->whereNull('parent_id')
                            ->where('is_active', true)
                            ->when($user, function ($query) use ($user) {
                                $query->where(function ($q) use ($user) {
                                    $q->whereNull('permission')
                                      ->orWhereIn('permission', $user->permissions);
                                });
                            })
                            ->with(['children' => function($query) use ($user) {
                                $query->where('is_active', true)
                                    ->when($user, function ($q) use ($user) {
                                        $q->where(function ($sq) use ($user) {
                                            $sq->whereNull('permission')
                                               ->orWhereIn('permission', $user->permissions);
                                        });
                                    })
                                    ->orderBy('sort_order');
                            }])
                            ->orderBy('sort_order')
                            ->get(),
                    ];
                }),
            ],
            'translations' => array_merge(
                is_file(base_path("lang/".app()->getLocale().".json")) 
                    ? json_decode(file_get_contents(base_path("lang/".app()->getLocale().".json")), true) 
                    : [],
                // Add PHP-based translations if needed, but here we focus on JSON for React
            ),
        ];
    }
}
