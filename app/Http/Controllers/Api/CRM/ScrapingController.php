<?php

namespace App\Http\Controllers\Api\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CRM\LeadScraperService;
use App\Models\Crm\ScrapingRun;

class ScrapingController extends Controller
{
    protected $scraperService;

    public function __construct(LeadScraperService $scraperService)
    {
        $this->scraperService = $scraperService;
    }

    public function import(Request $request)
    {
        $payload = $request->all();
        // Assume user id 1 for testing if not auth
        $userId = auth()->id() ?? 1;

        try {
            $run = $this->scraperService->importApifyData($payload, $userId);
            return response()->json([
                'success' => true,
                'message' => 'Scraping data imported successfully',
                'data' => $run,
                'saved' => $run->results_count,
                'skipped' => $run->skipped_count_temp ?? 0
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function history()
    {
        $history = ScrapingRun::with('user:id,name')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $history]);
    }
}
