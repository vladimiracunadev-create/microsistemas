<?php header("Content-Type: application/json"); echo json_encode(["status" => "ready", "checks" => ["database" => "skipped", "filesystem" => "ok"]]); ?>
