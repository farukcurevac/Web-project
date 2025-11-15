<?php
class Response {
    public static function json($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode(['success' => $status >= 200 && $status < 300, 'data' => $data]);
        exit(0);
    }

    public static function error($message, $status = 500, $details = null) {
        http_response_code($status);
        header('Content-Type: application/json');
        $payload = ['success' => false, 'error' => ['message' => $message]];
        if ($details) $payload['error']['details'] = $details;
        echo json_encode($payload);
        exit(0);
    }
}

?>
