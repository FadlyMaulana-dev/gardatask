<?php

namespace App\Services\CRM;

use App\Models\Crm\Lead;
use App\Models\Crm\ScrapingRun;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LeadScraperService
{
    /**
     * Parse Apify JSON data and store/update them in leads table
     *
     * @param array $payload
     * @param int $userId
     * @return ScrapingRun
     */
    public function importApifyData(array $payload, int $userId): ScrapingRun
    {
        $results = $payload['data'] ?? [];
        $limit = $payload['limitData'] ?? count($results);
        $keyword = $payload['keyword'] ?? 'Imported Dataset';
        $source = $payload['source'] ?? 'apify_google_maps';
        
        $run = ScrapingRun::create([
            'keyword' => $keyword,
            'source' => $source,
            'limit_data' => $limit,
            'results_count' => 0,
            'run_date' => Carbon::now(),
            'user_id' => $userId,
        ]);

        $insertedCount = 0;
        $skippedCount = 0;

        foreach ($results as $item) {
            $sourceId = $item['placeId'] ?? md5(json_encode($item));

            // Prevent duplicate based on source_id or exact phone
            $existing = Lead::where('source_id', $sourceId)->first();
            
            if (!$existing && isset($item['phoneUnformatted'])) {
                $existing = Lead::where('whatsapp', $item['phoneUnformatted'])
                                ->orWhere('phone', $item['phoneUnformatted'])
                                ->first();
            }

            if (!$existing) {
                Lead::create([
                    'company_name' => $item['title'] ?? 'Unknown',
                    'category'     => $item['categoryName'] ?? null,
                    'phone'        => $item['phoneUnformatted'] ?? $item['phone'] ?? '',
                    'whatsapp'     => $item['phoneUnformatted'] ?? null,
                    'website'      => $item['website'] ?? null,
                    'address'      => $item['address'] ?? null,
                    'city'         => $item['city'] ?? null,
                    'province'     => $item['state'] ?? null,
                    'country'      => $item['countryCode'] ?? null,
                    'latitude'     => $item['location']['lat'] ?? null,
                    'longitude'    => $item['location']['lng'] ?? null,
                    'rating'       => $item['totalScore'] ?? null,
                    'source_id'    => $sourceId,
                    'source'       => $source,
                    'status'       => 'New',
                ]);
                $insertedCount++;
            } else {
                $skippedCount++;
            }
        }

        $run->update(['results_count' => $insertedCount]);
        $run->skipped_count_temp = $skippedCount;

        return $run;
    }
}
