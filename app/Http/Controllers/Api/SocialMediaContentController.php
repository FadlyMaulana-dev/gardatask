<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaContent;
use Illuminate\Http\Request;

class SocialMediaContentController extends Controller
{
    public function index()
    {
        // Limit to latest 500 rows to prevent DB Out-of-Memory on massive tables
        // without breaking the simple Array JSON structure that frontend expects.
        return response()->json(SocialMediaContent::orderBy('created_at', 'desc')->take(500)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hari' => 'nullable|string',
            'format' => 'nullable|string',
            'konsep' => 'nullable|string',
            'funnel_layer' => 'nullable|string',
            'deskripsi_ide' => 'nullable|string',
            'storyboard' => 'nullable|string',
            'caption' => 'nullable|string',
            'progres' => 'nullable|string',
        ]);

        $content = SocialMediaContent::create($validated);
        return response()->json($content, 201);
    }

    public function show(SocialMediaContent $sosmed)
    {
        return response()->json($sosmed);
    }

    public function update(Request $request, SocialMediaContent $sosmed)
    {
        $validated = $request->validate([
            'hari' => 'nullable|string',
            'format' => 'nullable|string',
            'konsep' => 'nullable|string',
            'funnel_layer' => 'nullable|string',
            'deskripsi_ide' => 'nullable|string',
            'storyboard' => 'nullable|string',
            'caption' => 'nullable|string',
            'progres' => 'nullable|string',
        ]);

        $sosmed->update($validated);
        return response()->json($sosmed);
    }

    public function destroy(SocialMediaContent $sosmed)
    {
        $sosmed->delete();
        return response()->json(null, 204);
    }
}
