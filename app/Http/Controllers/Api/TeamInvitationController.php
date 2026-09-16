<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Mail\TeamInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TeamInvitationController extends Controller
{
    /**
     * Send an invitation to an email address.
     * Only Project Manager can do this.
     */
    public function invite(Request $request)
    {
        // Hanya Project Manager yang boleh mengundang
        if (auth()->user()->role !== 'project_manager') {
            return response()->json(['message' => 'Unauthorized. Hanya Project Manager yang dapat mengundang anggota.'], 403);
        }

        $request->validate([
            'email'   => 'required|email',
            'role'    => 'required|in:project_manager,sosmed,finance,marketing,member',
            'jabatan' => 'required|string|max:100',
        ]);

        $email   = $request->email;
        $role    = $request->role;
        $jabatan = $request->jabatan;

        // Cek jika user sudah terdaftar di sistem
        if (User::where('email', $email)->exists()) {
            return response()->json(['message' => 'User dengan email ini sudah terdaftar.'], 400);
        }

        // Hapus undangan sebelumnya untuk email ini jika ada
        TeamInvitation::where('email', $email)->delete();

        // Buat token unik
        $token = Str::random(64);

        // Buat record undangan
        $invitation = TeamInvitation::create([
            'email'      => $email,
            'role'       => $role,
            'jabatan'    => $jabatan,
            'token'      => $token,
            'invited_by' => auth()->id(),
        ]);

        // Kirim email
        try {
            Mail::to($email)->send(new TeamInvitationMail($invitation));
        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'Invitation sent successfully.',
            'invitation' => $invitation
        ]);
    }

    /**
     * Verify an invitation token.
     */
    public function verify($token)
    {
        $invitation = TeamInvitation::where('token', $token)->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invalid or expired invitation token.'], 404);
        }

        return response()->json([
            'valid'   => true,
            'email'   => $invitation->email,
            'jabatan' => $invitation->jabatan,
            'role'    => $invitation->role,
        ]);
    }

    /**
     * Accept invitation and register the user.
     */
    public function accept(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'name'     => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $invitation = TeamInvitation::where('token', $request->token)->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invalid or expired invitation token.'], 404);
        }

        // Double check jika email ternyata sudah mendaftar
        if (User::where('email', $invitation->email)->exists()) {
            $invitation->delete();
            return response()->json(['message' => 'Email is already registered. Please login.'], 400);
        }

        DB::beginTransaction();
        try {
            // Buat user dengan role dan jabatan dari invitation
            $user = User::create([
                'name'     => $request->name,
                'email'    => $invitation->email,
                'password' => Hash::make($request->password),
                'role'     => $invitation->role,
                'jabatan'  => $invitation->jabatan,
            ]);

            // Hapus invitation
            $invitation->delete();

            DB::commit();

            // Auto-login (generate token Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful.',
                'user'    => $user,
                'token'   => $token
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to register user.'], 500);
        }
    }
}
