<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * GET /api/messages
     * Returns latest 60 messages (oldest first so chat reads top-down).
     */
    public function index()
    {
        $messages = Message::with('user:id,name')
            ->latest()
            ->take(60)
            ->get()
            ->reverse()
            ->values();

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * GET /api/messages/since/{id}
     * Returns only messages newer than the given message id.
     * Used by the frontend poller to avoid re-fetching everything.
     */
    public function since($lastId)
    {
        $messages = Message::with('user:id,name')
            ->where('id', '>', (int) $lastId)
            ->oldest()
            ->take(50)
            ->get();

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * POST /api/messages
     * Stores a new message for the authenticated user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'user_id' => auth()->id(),
            'body'    => $request->body,
        ]);

        $message->load('user:id,name');

        return response()->json(['success' => true, 'data' => $message], 201);
    }
}
