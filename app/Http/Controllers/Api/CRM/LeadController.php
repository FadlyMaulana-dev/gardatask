<?php

namespace App\Http\Controllers\Api\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Crm\Lead;
use App\Models\Crm\LeadActivity;
use App\Services\CRM\KpiScoringService;

class LeadController extends Controller
{
    protected $kpiService;

    public function __construct(KpiScoringService $kpiService)
    {
        $this->kpiService = $kpiService;
    }

    // ── GET /crm/leads ──────────────────────────────────────
    public function index(Request $request)
    {
        $query = Lead::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($q2) use ($q) {
                $q2->where('company_name', 'like', "%{$q}%")
                   ->orWhere('city', 'like', "%{$q}%")
                   ->orWhere('category', 'like', "%{$q}%");
            });
        }

        $leads = $query->orderBy('created_at', 'desc')->paginate(50);
        return response()->json(['success' => true, 'data' => $leads]);
    }

    // ── POST /crm/leads ──────────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'category'     => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:50',
            'whatsapp'     => 'nullable|string|max:50',
            'website'      => 'nullable|string|max:255',
            'address'      => 'nullable|string',
            'city'         => 'nullable|string|max:100',
            'province'     => 'nullable|string|max:100',
            'country'      => 'nullable|string|max:100',
            'status'       => 'nullable|string',
        ]);

        // Generate unique source_id untuk manual entry
        $data['source']    = 'manual';
        $data['source_id'] = 'manual_' . time() . '_' . rand(1000, 9999);
        $data['status']    = $data['status'] ?? 'New';

        $lead = Lead::create($data);

        // Log aktivitas import otomatis
        $userId = auth()->id() ?? 1;
        $this->kpiService->logActivity($lead->id, $userId, 'Import Lead', 'Manual lead creation');

        return response()->json(['success' => true, 'data' => $lead], 201);
    }

    // ── GET /crm/leads/{id} ──────────────────────────────────
    public function show($id)
    {
        $lead = Lead::with([
            'activities' => fn($q) => $q->orderBy('created_at', 'desc')->take(50),
            'activities.user:id,name',
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $lead]);
    }

    // ── GET /crm/leads/{id}/activities ───────────────────────
    public function getActivities($id)
    {
        Lead::findOrFail($id); // pastikan lead ada

        $activities = LeadActivity::with('user:id,name')
            ->where('lead_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $activities]);
    }

    // ── PATCH /crm/leads/{id}/status ─────────────────────────
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);

        $lead = Lead::findOrFail($id);
        $oldStatus = $lead->status;
        $lead->status = $request->status;
        $lead->save();

        // Log KPI otomatis jika status berubah ke tahap penting
        $userId = auth()->id() ?? 1;
        $kpiMap = [
            'Contacted'  => 'Contacted',
            'Follow Up'  => 'Follow Up',
            'Proposal'   => 'Proposal Sent',
            'Closed Won' => 'Deal',
        ];

        if (isset($kpiMap[$request->status]) && $oldStatus !== $request->status) {
            $this->kpiService->logActivity(
                $lead->id,
                $userId,
                $kpiMap[$request->status],
                "Status berubah dari {$oldStatus} ke {$request->status}"
            );
        }

        return response()->json(['success' => true, 'data' => $lead]);
    }

    // ── POST /crm/leads/{id}/activity ────────────────────────
    public function logActivity(Request $request, $id)
    {
        $request->validate([
            'activity_type' => 'required|string',
            'notes'         => 'nullable|string',
        ]);

        $userId = auth()->id() ?? 1;

        $activity = $this->kpiService->logActivity(
            $id,
            $userId,
            $request->activity_type,
            $request->notes
        );

        // Load relasi user untuk dikembalikan ke frontend
        $activity->load('user:id,name');

        return response()->json(['success' => true, 'data' => $activity]);
    }
}
