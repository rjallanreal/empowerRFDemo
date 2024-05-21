<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Redis;

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\Exceptions\MqttClientException;

$router->group(['prefix' => ''], function () use ($router) {
    $router->get('/write-to-file', function () {
        $filePath = storage_path('logs/simple_route.log'); // Ensure the directory exists and is writable
    
        // Write a simple message to the log file
        $message = date('Y-m-d H:i:s') . " - Simple route accessed\n";
        file_put_contents($filePath, $message, FILE_APPEND);
    
        return response()->json(['status' => 'Message written to file']);
    });

    $router->get('getLog', function () {

        $logFile = storage_path('logs/getLog.log');
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - IN ENDPOINT\n", FILE_APPEND);
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        
        $redis = Redis::connection();
        $keepAliveTime = 300; // 5 minutes
        $lastKeepAlive = time();
        $logs = DB::table('log')->orderByDesc('timestamp')->take(10)->get();
        $logEntries = $logs->map(function ($log) {
            return [
                'frequency' => $log->frequency,
                'name' => $log->name,
                'dateTime' => $log->timestamp
            ];
        })->toArray();
        $initial = json_encode($logEntries);
        echo "data: $initial\n\n";
        ob_flush();
        flush();
        // Keep the connection open and check for client disconnection
        while (true) {
        $redis->subscribe(['radioFrequencyChannel'], function ($message) use ($redis, &$lastKeepAlive) {
            $logs = DB::table('log')->orderByDesc('timestamp')->take(10)->get();
            $logEntries = $logs->map(function ($log) {
                return [
                    'frequency' => $log->frequency,
                    'name' => $log->name,
                    'dateTime' => $log->timestamp
                ];
            })->toArray();
            $initial = json_encode($logEntries);
            echo "data: $initial\n\n";
            ob_flush();
            flush();
    
            $lastKeepAlive = time();
    
            // Check if client has disconnected
            if (connection_aborted()) {
                $redis->unsubscribe(['radioFrequencyChannel']);
                exit();
            }
        });
        }
    
    });

    $router->get('radioFrequency', function () {

        $logFile = storage_path('logs/radioFrequency.log');
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - IN ENDPOINT\n", FILE_APPEND);
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        
        $redis = Redis::connection();
        $keepAliveTime = 300; // 5 minutes
        $lastKeepAlive = time();
        $log = DB::table('log')->orderByDesc("timestamp")->first();
        $initial = json_encode(['frequency' => $log->frequency]);
        echo "data: $initial\n\n";
        ob_flush();
        flush();
        // Keep the connection open and check for client disconnection
        while (true) {
        $redis->subscribe(['radioFrequencyChannel'], function ($message) use ($redis, &$lastKeepAlive) {
            echo "data: $message\n\n";
            ob_flush();
            flush();
    
            $lastKeepAlive = time();
    
            // Check if client has disconnected
            if (connection_aborted()) {
                $redis->unsubscribe(['radioFrequencyChannel']);
                exit();
            }
        });
        }
    
    });
    

    $router->post('changeChannel', function (Request $request) {
        $pid = 0;
        $name = $request->input('name');
        $frequency = $request->input('channel');
        $workingDirectory = base_path('../empower-rf-app/dist/empower-rf-app/browser'); 
        $radioDirectory = base_path('../radio');
        
        if (!$name || !$frequency) {
            return response()->json(['error' => 'Name and frequency are required'], 400);
        }

        $user = DB::table('users')->where('name', $name)->first();
        $currentTimestamp = time();
        $logFile = storage_path('logs/changeChannel.log');
        file_put_contents($logFile, date('Y-m-d H:i:s') .  " - IN ENDPOINT" .  $frequency . "\n", FILE_APPEND);
        if ($user) {
            // Check if the current time is more than a minute since the saved timestamp
            if ($currentTimestamp - strtotime($user->timestamp) < 60) {
                return response()->json(['error' => 'Request too frequent'], 429);
            }
        } 

         // Define the number of retries and delay between attempts
         $maxRetries = 5;
         $retryDelay = 200000; // 200 milliseconds

        $lock = app('cache')->lock('changeChannel', 10);
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - LOCKED\n", FILE_APPEND);

        // Attempt to acquire the lock with retries
        $acquiredLock = false;
        for ($i = 0; $i < $maxRetries; $i++) {
            if ($lock->get()) {
                $acquiredLock = true;
                break;
            }
            usleep($retryDelay); // Wait before the next attempt
        }

        if (!$acquiredLock) {
            return response()->json(['error' => 'Another request is already being processed'], 429);
        }

        try {
            
            $server   = '127.0.0.1'; // Replace with your MQTT broker address
            $port     = 1883; // Default MQTT port
            $clientId = 'php-mqtt-client';
            $topic    = 'frequency/topic';
            $message = $frequency;
            try {
                $mqtt = new MqttClient($server, $port, $clientId);
                $mqtt->connect();
                $mqtt->publish($topic, $message, 0);
                $mqtt->disconnect();
                //return response()->json(['status' => 'Message published successfully!']);
            } catch (MqttClientException $e) {
                return response()->json(['error' => 'Failed to publish message: ' . $e->getMessage()], 500);
        }
            // Update the database
            DB::table('users')->updateOrInsert(
                ['name' => $name],
                ['timestamp' => date('Y-m-d H:i:s', $currentTimestamp), 'frequency' => $frequency, 'pid' => $pid, 'pid2' => $pid]
            );

            DB::table('log')->updateOrInsert(
                ['timestamp' => date('Y-m-d H:i:s', $currentTimestamp)],
                ['name' => $name, 'frequency' => $frequency, 'pid' => $pid, 'pid2' => $pid]
            );

            Redis::publish('radioFrequencyChannel', json_encode(['frequency' => $frequency]));

            // Return success response
            return response()->json(['message' => 'Channel changed successfully']);
        } finally {
            $lock->release();
        }
    });
});
