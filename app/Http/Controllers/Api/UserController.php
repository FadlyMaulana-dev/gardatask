<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
    {
        // Simple return of users with related tasks count to mimic the "tasks: 24" stat.
        $users = User::withCount('tasks')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function destroy($id)
    {
        // Don't allow deleting the main admin
        if ($id == 1) {
            return response()->json(['message' => 'Cannot delete the primary admin account.'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        try {
            // Reassign resources to the primary admin (ID 1) before deleting
            \App\Models\Task::where('user_id', $id)->update(['user_id' => 1]);
            \App\Models\Project::where('user_id', $id)->update(['user_id' => 1]);
            
            // Check if Crm classes exist before reassigning (in case modules are disabled)
            if (class_exists(\App\Models\Crm\LeadActivity::class)) {
                \App\Models\Crm\LeadActivity::where('user_id', $id)->update(['user_id' => 1]);
            }
            if (class_exists(\App\Models\Invoice::class)) {
                \App\Models\Invoice::where('user_id', $id)->update(['user_id' => 1]);
            }

            $user->delete();

            return response()->json(['message' => 'User deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus anggota: Masih ada data (' . $e->getMessage() . ')'], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json(['success' => true, 'message' => 'Profil berhasil disimpan.', 'user' => $user]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password'     => ['required', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Kata sandi saat ini tidak sesuai.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['success' => true, 'message' => 'Kata sandi berhasil diubah.']);
    }
}
