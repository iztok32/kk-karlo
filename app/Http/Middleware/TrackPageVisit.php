<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageVisit
{
    // Preskočimo te route pri sledenju
    const SKIP_ROUTES = [
        'debugbar.*',
        'livewire.*',
        'ignition.*',
        'horizon.*',
        'telescope.*',
    ];

    const SKIP_PREFIXES = [
        '/_debugbar',
        '/livewire',
        '/api/',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            $this->record($request);
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        // Samo GET zahteve
        if (! $request->isMethod('GET')) return false;

        // Samo HTML odgovori (ne JSON/API)
        if ($request->expectsJson()) return false;

        // Preskočimo AJAX/Inertia partial requests
        if ($request->header('X-Inertia')) return false;

        // Preskočimo določene URL predpone
        $path = $request->getPathInfo();
        foreach (self::SKIP_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) return false;
        }

        // Samo uspešni in preusmerjevalni odgovori
        $status = $response->getStatusCode();
        if ($status >= 400) return false;

        return true;
    }

    private function record(Request $request): void
    {
        try {
            PageVisit::create([
                'user_id'    => auth()->id(),
                'url'        => substr($request->getPathInfo(), 0, 500),
                'route_name' => optional($request->route())->getName(),
                'ip_address' => $request->ip(),
                'session_id' => session()->getId(),
                'visited_at' => now(),
            ]);
        } catch (\Throwable) {
            // Ne prekinjamo zahteve če sledenje ne uspe
        }
    }
}
